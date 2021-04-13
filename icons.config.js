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
  let svg = item.isElem('svg') ? item : item.closestElem('svg');
  let viewBox = svg.attr("viewBox").value;
  let size = vbSizeMapping[viewBox];
  return size;
}

module.exports = {
  multipass: true, // boolean. false by default
  plugins: extendDefaultPlugins([
    {
      name: "removeClassedPlaceholderRect",
      description: "Many of the icons have a empty fill:none rect, possible via a class of cls-2; remove it",
      type: "perItem",
      active: true,
      fn: (item) => {
        if (item.hasAttr("class") && item.attr("class").value.includes("cls-2")) {
          return false;
        }
        let styleValue = item.hasAttr("style") && item.attr("style").value;
        if (styleValue && styleValue.match(/\s*fill\s*:\s*none[;\s]*/)) {
          return false;
        }
        return true;
      }
    },
    {
      name: 'convertPathData',
      active: true,
      params: {
        'straightCurves': false,
        'lineShorthands': false,
        'curveSmoothShorthands': false,
      }
    },
    {
      name: 'mergePaths',
      active: false
    },
    {
      name: 'cleanupNumericValues',
      active: true,
      params: {
        floatPrecision: 2
      }
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
      name: "removePlaceholderRect",
      description: "Many of the icon SVGs have an empty, full-size, fill=none rect; remove it.",
      type: "perItem",
      active: false,
      fn: (item) => {
        // runs after the rect and other shapes are converted to paths by convertShapeToPath plugin
        if (item.isElem("path")) {
          let size = getIconSizeForElem(item);
          let d = item.attr("d").value;
          // if its a full-size rect and with no fill or style, remove it
          if (d == "") {
            return false;
          }
          if (
            (size == 16 && d == "M0 0h16v16H0z") ||
            (size == 20 && d == "M0 0H20V20H0z")
          ) {
            if (
              (!item.hasAttr("fill") || item.attr("fill").value != "none") || 
              (!item.hasAttr("stroke") || item.attr("stroke").value != "none")
            ) {
              return true;
            }
            return false;
          }
        }
        return true;
      },
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
      name: "removeEmptyStyle",
      description: "Remove any empty style elements",
      type: "perItem",
      active: true,
      fn: (item, params) => {
        if (item.isElem('style')) {
          let cssText = item.content[0].text || item.content[0].cdata;
          if (!cssText) {
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
      active: true,
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