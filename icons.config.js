const addLicensePlugin = require('./plugins/add-license.js');
const contextFillStrokePlugin = require('./plugins/context-fill-stroke.js');
const removeEmptyShapesPlugin = require('./plugins/remove-empty-shapes.js');

const JSAPI = require('svgo/lib/svgo/jsAPI.js');
const {
  querySelector,
  closestByName,
  visitSkip,
} = require('svgo/lib/xast.js');

function getIconSizeForElem(item) {
  const vbSizeMapping = {
    "0 0 20 20": 20,
    "0 0 16 16": 16,
    "0 0 12 12": 12,
  };
  let svg = item.name == "svg" ? item : closestByName(item, "svg");
  let viewBox = svg.attributes.viewBox;
  let size = vbSizeMapping[viewBox];
  return size;
}

module.exports = {
  multipass: true, // boolean. false by default
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          convertPathData: {
            'straightCurves': false,
            'lineShorthands': false,
            'curveSmoothShorthands': false,
          },
          mergePaths: false,
          removeViewBox: false,
          cleanupNumericValues: {
            floatPrecision: 2
          },
          inlineStyles: {
            onlyMatchedOnce: false,
            removeMatchedSelectors: true,
            useMqs: ['', 'screen'],
            usePseudos: [''],
          }
        }
      }
    },
    removeEmptyShapesPlugin,
    {
      name: "removePlaceholderRect",
      description: "Many of the icon SVGs have an empty, full-size, fill=none rect; remove it.",
      type: "visitor",
      active: true,
      fn: () => {
        // runs after the rect and other shapes are converted to paths by convertShapeToPath plugin
        return {
          element: {
            enter: (node, parentNode) => {
              if (node.name !== "path") {
                return;
              }
              let d = node.attributes.d;
              if (!d) {
                return;
              }
              d = d.toLowerCase();
              let size = getIconSizeForElem(node);
              // if its a full-size rect and with no fill or style, remove it
              if (
                (size == 16 && d == "m0 0h16v16h0z") ||
                (size == 20 && d == "m0 0h20v20h0z")
              ) {
                if (
                  (!node.attributes.fill || node.attributes.fill == "none") ||
                  (!node.attributes.stroke || node.attributes.stroke == "none")
                ) {
                  console.log("removing empty element:", node.name, d, size);
                  parentNode.children = parentNode.children.filter((child) => child !== node);
                }
              }
            }
          }
        }
      },
    },
    {
      name: "removeBogusRootElementStuff",
      type: "visitor",
      fn: () => {
        return {
          root: {
            enter: (node) => {
              if (!(node.children && node.children.length)) {
                return;
              }
              for (let item of node.children) {
                if (item.name == "svg") {
                  delete item.attributes["id"];
                  delete item.attributes["data-name"];
                  delete item.attributes["style"];
                  delete item.attributes["xml:space"];
                }
              }
            }
          }
        }
      }
    },
    {
      name: "removeEmptyStyle",
      description: "Remove any empty style elements",
      type: "visitor",
      active: true,
      fn: () => {
        return {
          element: (node, parentNode) => {
            if (node.name == "style") {
              let cssText = "";
              for (let child of node.children) {
                cssText += child.value;
              }
              if (!cssText.trim()) {
                // the whole style element is just empty text nodes
                parentNode.children = parentNode.children.filter((child) => child !== node);
              }
            }
          }
        }
      }
    },
    {
      name: "addWidthHeightAttributes",
      description: "All the icons should have width and height attributes on the SVG element",
      type: "visitor",
      active: true,
      fn: () => {
        return {
          element: {
            enter: (node, parentNode) => {
              if (node.name == "svg" && node.attributes.viewBox) {
                let viewBox = node.attributes.viewBox;
                let size = getIconSizeForElem(node);
                if (size) {
                  node.attributes.width = ""+size;
                  node.attributes.height = ""+size;
                } else {
                  console.log("Unexpected viewBox:" + viewBox);
                }
              }
            }
          }
        }
      },
    },
    Object.assign({}, contextFillStrokePlugin, {
      active: true,
      params: Object.assign({}, contextFillStrokePlugin.params, {
        fill: "#5b5b66",
        stroke: ["yellow", "#ff0"]
      }),
    }),
    addLicensePlugin,
  ],
  js2svg: {
    indent: 2, // string with spaces or number of spaces. 4 by default
    pretty: true, // boolean, false by default
  }
};