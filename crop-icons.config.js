const { extendDefaultPlugins } = require('svgo');
const collections = require('svgo/plugins/_collections.js');
const removeEmptyShapes = require('./plugins/remove-empty-shapes.js');
/**
 * The icon shapes/paths are all the correct size, but have 2px padding around them.
 */

function getTargetIconSizeForElem(item) {
  const vbSizeMapping = {
    "0 0 24 24": 24,
    "0 0 20 20": 20,
    "0 0 16 16": 16,
    "0 0 12 12": 12,
  };
  let svg = item.name == "svg" ? item : item.closestElem("svg");
  let viewBox = svg.attributes.viewBox;
  let size = vbSizeMapping[viewBox];
  return size;
}

module.exports = {
  multipass: false, // boolean. false by default
  plugins: [
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
                  delete item.attributes["x"];
                  delete item.attributes["y"];
                  // we'll use viewBox for width/height
                  item.removeAttr("width");
                  item.removeAttr("height");
                }
              }
            }
          }
        }
      }
    },
    removeEmptyShapes,
    {
      name: "offsetPathsAndShapes",
      type: "visitor",
      description: "Adds a transform to move all paths & shapes up & left by 2",
      fn: () => {
        return {
          element: {
            enter: (node, parentNode) => {
              // add a transform attr to any shape or path element
              if (!(collections.elemsGroups.shape.includes(node.name) || collections.pathElems.includes(node.name))) {
                return;
              }
              let width = node.attributes.width && parseFloat(node.attributes.width);
              let height = node.attributes.height && parseFloat(node.attributes.height);

              if (width && height) {
                let svgElem = node.closestElem("svg");
                let vbValue = svgElem.attributes.viewBox;
                if (!vbValue) {
                  console.log("Unexpected viewBox:", ("viewBox" in svgElem.atttributes) ? "missing viewBox attribute on svg parent" : vbValue);
                  return;
                }
                let [x, y, vbWidth, vbHeight] = vbValue.split(' ').map(val => parseFloat(val));
                if (width >= vbWidth && height >= vbHeight) {
                  if (
                    node.attributes['class'] && node.attributes['class'].includes("cls-2")
                  ) {
                    // these are empty, transparent rects we can just remove
                    parentNode.children = parentNode.children.filter((child) => child !== node);
                    return;
                  }
                  node.attributes.width = (vbWidth - 4).toString();
                  node.attributes.height = (vbHeight - 4).toString();
                  return;
                }
              }
              // convertShapeToPath is missing the circles, do the offseting here
              if (node.name == "circle") {
                let x = node.attributes["cx"];
                let y = node.attributes["cy"];
                if (x && y) {
                  item["cx"] = (parseFloat(x) - 2).toString();
                  item["cy"] = (parseFloat(y) - 2).toString();
                }
                return;
              }

              let transforms = [];
              if (node.attributes["transform"]) {
                transforms = node.attributes["transform"].split(/,\s*/);
              }
              transforms.push('translate(-2,-2)');
              node.attributes["transform"] = transforms.join(",");
              console.log("added transform:", node.name, node.attributes["transform"]);
            }
          }
        }
      }
    },
    {
      name: "resizeFullsizeRects",
      description: "Adjust size of full-width & height rects",
      type: "visitor",
      active: true,
      fn: () => {
        let iconSize;
        return {
          element: {
            enter: (node, parentNode) => {
              if (node.name == "svg") {
                iconSize = getTargetIconSizeForElem(node);
                console.log("got iconSize", iconSize);
                if (!iconSize) {
                  console.log("Couldn't determine size, viewBox:", node.hasAttr("viewBox") ? node.attributes.viewBox : "missing viewBox attribute");
                  return;
                }
              }
              if (node.name == "rect" && node.attributes.width && node.attributes.height) {
                if (
                  parseInt(node.attributes.width) == iconSize + 4 &&
                  parseInt(node.attributes.height) == iconSize + 4
                ) {
                  node.attributes.width = "" + iconSize;
                  node.attributes.height = "" + iconSize;
                }
              }
            }
          }
        }
      }
    },
    {
      name: "preset-default",
      params: {
        overrides: {
          convertPathData: {
            'straightCurves': false,
            'lineShorthands': false,
            'curveSmoothShorthands': false,
          },
          inlineStyles: false,
          mergePaths: false,
          removeViewBox: false,
          convertStyleToAttrs: false,
          convertShapeToPath: false,
          cleanupNumericValues: false,
        }
      }
    },
    {
      name: "resizeViewbox",
      description: "Subtract the 2px padding from the viewBox",
      type: "visitor",
      active: true,
      fn: (data) => {
        return {
          element: {
            enter: (node, parentNode) => {
              if (node.name == "svg") {
                let iconSize = getTargetIconSizeForElem(node);
                if (!iconSize) {
                  console.log("Unexpected iconSize:", node.hasAttr("viewBox") ? node.attributes.viewBox : "missing viewBox attribute");
                  return;
                }
                node.attributes.viewBox = [0, 0, iconSize-4, iconSize-4].join(" ");
                console.log("new viewBox:", node.attributes.viewBox);
              }
            }
          }
        };
      }
    }
  ],
  js2svg: {
    indent: 2, // string with spaces or number of spaces. 4 by default
    pretty: true, // boolean, false by default
  }
};
