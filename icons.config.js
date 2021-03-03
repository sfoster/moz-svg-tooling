const { extendDefaultPlugins } = require('svgo');
const addLicensePlugin = require('./plugins/add-license.js');
const contextFillStrokePlugin = require('./plugins/context-fill-stroke.js');

module.exports = {
  multipass: true, // boolean. false by default
  plugins: extendDefaultPlugins([
    {
      name: 'convertPathData',
      active: false
    },
    {
      name: 'mergePaths',
      active: false
    },
    {
      name: 'inlineStyles',
      active: true,
      params: {
        onlyMatchedOnce: false,
        removeMatchedSelectors: true,
        useMqs: ['', 'screen'],
        usePseudos: [''],
      }
    },
    {
      name: "removeBogusIdAndDataName",
      type: "full",
      fn: (data) => {
        for (let item of data.content) {
          if (item.isElem('svg')) {
            item.removeAttr("id");
            item.removeAttr("data-name");
          }
        }
        return data;
      }
    },
    {
      name: "removePlaceholderRect",
      description: "Many of the icon SVGs have an empty, fill:none rect; remove it.",
      type: "perItem",
      fn: (item) => {
        // runs after the rect and other shapes are converted to paths by convertShapeToPath plugin
        if (item.isElem("path")) {
          if (item.attr("d").value !== "M0 0H20V20H0z") {
            return true;
          }
          if (!item.hasAttr("fill") || item.attr("fill").value == "none") {
            return false;
          } else {
            return true;
          }
        }
      }
    },
    contextFillStrokePlugin,
    addLicensePlugin,
  ]),
  js2svg: {
    indent: 2, // string with spaces or number of spaces. 4 by default
    pretty: true, // boolean, false by default
  }
};