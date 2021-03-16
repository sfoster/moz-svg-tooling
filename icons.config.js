const { extendDefaultPlugins } = require('svgo');
// const flattenTransforms = require('./plugins/flatten-transforms.js');
const addLicensePlugin = require('./plugins/add-license.js');
const contextFillStrokePlugin = require('./plugins/context-fill-stroke.js');

function getIconSizeForElem(item) {
  const vbSizeMapping = {
    "0 0 20 20": 20,
    "0 0 16 16": 16,
    "0 0 12 12": 12,
  };
  let svg = item.isElem('svg') || item.closestElem('svg');
  let viewBox = svg.attr("viewBox").value;
  let size = vbSizeMapping[viewBox];
  return size;
}

module.exports = {
  multipass: true, // boolean. false by default
  plugins: extendDefaultPlugins([
    {
      name: 'convertPathData',
      active: false,
      params: {
        'straightCurves': false,
        'lineShorthands': false,
        'curveSmoothShorthands': false,
      }
    },
    {
      name: 'cleanupNumericValues',
      active: false
    },
    {
      name: 'mergePaths',
      active: false
    },
    {
      name: 'removeViewBox',
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
      name: "removeBogusRootElementStuff",
      type: "full",
      fn: (data) => {
        for (let item of data.content) {
          if (item.isElem('svg')) {
            item.removeAttr("id");
            item.removeAttr("data-name");
            item.removeAttr("style");
            item.removeAttr("xml:space");
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
          let size = getIconSizeForElem(item);
          let d = item.attr("d").value;
          console.log("got size for path: ", size, d);
          if (d == "") {
            return false;
          }
          // if (size == 20 && d == "0h20v20h0z") {
          //   return false;
          // }
          if (size == 16 && d == "M0 0h16v16H0z") {
            return false;
          }
          if (size == 20 && d == "M0 0H20V20H0z") {
            return false;
          }

          // if (size == 12 && d == "0h12v12h0z") {
          //   return false;
          // }
        }
        return true;
      },
    },
    {
      name: "removeEmptyStyle",
      description: "Remove any empty style elements",
      type: "perItem",
      active: true,
      fn: (item, params) => {
        if (item.isElem('style')) {
          console.log('removeEmptyStyle:',  item);
          let cssText = item.content[0].text || item.content[0].cdata;
          if (!cssText || !cssText.length) {
            return false;
          }
        }
        return true;
      }
    },
    {
      name: "addWidthHeightAttributes",
      description: "All the icons should have width and height attributes on the SVG element",
      type: "perItem",
      params: {
        reduceSize: false 
      },
      active: false,
      fn: (item, params) => {
        if (item.isElem("svg") && item.hasAttr("viewBox")) {
          let viewBox = item.attr("viewBox").value;
          let size = getIconSizeForElem(item);
          if (size) {
            item.addAttr({
                    name: 'width',
                    value: size,
                    prefix: '',
                    local: 'width',
            });
            item.addAttr({
                    name: 'height',
                    value: size,
                    prefix: '',
                    local: 'height',
            });
          } else {
            console.log("Unexpected viewBox:" + viewBox);
          }
        }
      },
    },
    contextFillStrokePlugin,
    addLicensePlugin,
  ]),
  js2svg: {
    indent: 2, // string with spaces or number of spaces. 4 by default
    pretty: true, // boolean, false by default
  }
};