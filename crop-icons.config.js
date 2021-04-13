const { extendDefaultPlugins } = require('svgo');
const collections = require('svgo/plugins/_collections.js');
const JSAPI = require('svgo/lib/svgo/jsAPI.js');

/**
 * The icon shapes/paths are all the correct size, but have 2px padding around them. 
 */

function getIconSizeForElem(item) {
  let svg = item.isElem('svg') ? item : item.closestElem('svg');
  let viewBox;
  try {
    viewBox = svg.attr("viewBox").value;
  } catch (e) {
    console.log("Failed to get viewBox from:", svg);
    throw e;
  }
  let [x, y, vbWidth, vbHeight] = viewBox.split(' ').map(v => parseFloat(v));
  if (vbWidth != vbHeight) {
    console.log("Unexpected viewBox width/height: not square:", vbWidth, vbHeight);
  }
  let size = vbWidth - 4;
  console.log("getIconSizeForElem, returning", size, "from: " + viewBox);
  return size;
}

module.exports = {
  multipass: false, // boolean. false by default
  plugins: [
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
            if (item.hasAttr("x")) {
              if (parseFloat(item.attr("x").value) != 0) {
                throw new Error("Non-0 origin");
              }
              item.removeAttr("x");
            }
            if (item.hasAttr("y")) {
              if (parseFloat(item.attr("y").value) != 0) {
                throw new Error("Non-0 origin");
              }
              item.removeAttr("y");
            }
            item.removeAttr("width");
            item.removeAttr("height");
          }
        }
        return data;
      }
    },
    {
      name: "offsetPathsAndShapes",
      description: "Adds a transform to move all paths & shapes up & left by 2",
      type: "perItem",
      fn: (item) => {
        // add a transform attr to any shape or path element
        if (collections.elemsGroups.shape.includes(item.elem) || collections.pathElems.includes(item.elem)) {
          let width = item.hasAttr("width") && item.attr("width").value;
          let height = item.hasAttr("height") && item.attr("height").value;
          if (width && height) {
            // if this is a full width/height shape, we want to adjust its dimensions, not move it
            // this is expecting a <rect>. If its already a <path d=""> its not going to work...
            // find the ancestor svg element
            let svgElem = item.closestElem("svg");
            let vbValue = svgElem.attr("viewBox").value;
            if (!vbValue) {
              console.log("Unexpected viewBox:", svgElem.hasAttr("viewBox") ? vbValue : "missing viewBox attribute on svg parent");
              return true;
            }
            let [x, y, vbWidth, vbHeight] = vbValue.split(' ');

            if (width >= vbWidth && height >= vbHeight) {
              if (item.hasAttr("class") && item.attr("class").value.includes("cls-2")) {
                // these are empty, transparent rects we can just remove
                return false;
              }
              item.attr("width").value = vbWidth - 4;
              item.attr("height").value = vbHeight - 4;
              return true;
            }
          }
          // convertShapeToPath is missing the circles, do the offseting here 
          if (item.elem == "circle") {
            let x = item.attr("cx").value;
            let y = item.attr("cy").value;
            if (x && y) {
              item.attr("cx").value = parseFloat(x) - 2;
              item.attr("cy").value = parseFloat(y) - 2;
            }
            return true;
          }

          let transforms = [];
          if (item.hasAttr("transform")) {
            transforms = item.attr("transform").value.split(/,\s*/);
          } else {
            item.addAttr({
              name:   'transform',
              prefix: '',
              local:  'transform',
              value:  ''
            });
          }
          transforms.push('translate(-2,-2)');
          item.attr("transform").value = transforms.join(",");
        }
        return true;
      }
    },
    {
      name: "resizeFullsizeRects",
      description: "Adjust size of full-width & height rects",
      type: "full",
      active: true,
      fn: (data) => {
        let svg = data.content.find(item => item.isElem("svg"));
        let iconSize = getIconSizeForElem(svg);
        console.log("got iconSize", iconSize);
        if (!iconSize) {
          console.log("Couldn't determine size, viewBox:", svg.hasAttr("viewBox") ? svg.attr("viewBox").value : "missing viewBox attribute");
          return data;
        }
        let rects = svg.querySelectorAll(`rect[width='${iconSize+4}'][height='${iconSize+4}']`);
        if (rects) {
          for (let rect of rects) {
            // adjust any full-size rects
            rect.attr("height").value = iconSizen;
            rect.attr("width").value = iconSize;
          }
        }
        return data;
      }
    },
    {
      name: 'convertShapeToPath',
      active: true, // convertPathData will flatten the transforms, but only on path elements
    },
    {
      name: 'convertTransform',
      active: true
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
      name: "inlineStyles",
      active: false,
    },
    {
      name: "resizeViewbox",
      description: "Subtract the 2px padding from the viewBox",
      type: "full",
      active: true,
      fn: (data) => {
        let svg = data.content.find(item => item.isElem("svg"));
        let iconSize = getIconSizeForElem(svg);
        if (!iconSize) {
          console.log("Unexpected iconSize:", svg.hasAttr("viewBox") ? svg.attr("viewBox").value : "missing viewBox attribute");
          return data;
        }
        svg.attr("viewBox").value = [0, 0, iconSize, iconSize].join(" ");
        return data;
      }
    }
  ],
  js2svg: {
    indent: 2, // string with spaces or number of spaces. 4 by default
    pretty: true, // boolean, false by default
  }
};