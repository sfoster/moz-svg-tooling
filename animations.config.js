const { extendDefaultPlugins } = require('svgo');
// const flattenTransforms = require('./plugins/flatten-transforms.js');
const addLicensePlugin = require('./plugins/add-license.js');
const contextFillStrokePlugin = require('./plugins/context-fill-stroke.js');
const reusePathsPlugin = require('./plugins/reusePaths.js');

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
      name: "removeBogusSVGElementStuff",
      type: "perItem",
      fn: (item) => {
        if (item.isElem('svg')) {
          item.removeAttr("id");
          item.removeAttr("data-name");
          item.removeAttr("style");
          item.removeAttr("xml:space");
        }
        return true;
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
    reusePathsPlugin,
    contextFillStrokePlugin,
    addLicensePlugin,
  ]),
  js2svg: {
    indent: 2, // string with spaces or number of spaces. 4 by default
    pretty: true, // boolean, false by default
  }
};