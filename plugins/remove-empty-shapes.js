'use strict';

exports.type = 'visitor';
exports.active = true;
exports.description = 'Strip out empty-looking shapes from icon SVGs';
exports.name = "remove-empty-shapes";

exports.fn = function() {
  const selectorDeclarations = {};
  const re = new RegExp("\\s*([^\{]+)\{([^\\}]+)\}", "g");
  return {
    text: {
      enter: (node, parentNode) => {
        if (parentNode.name == "style") {
          const re = new RegExp("\\s*([^\\{]+)\\{([^\\}]+)\\}", "gm"); //
          let str = node.value;
          for (let [m, sel, decl] of str.matchAll(re)) {
            for (let propertyValue of decl.split(/\s*;\s*/)) {
              let [prop, val] = propertyValue.split(/\s*:\s*/).map(v => v.trim());
              if (prop == "fill" && val == "none") {
                selectorDeclarations[sel] = decl;
              }
            }
          }
        }
      }
    },
    element: {
      enter: (node, parentNode) => {
        let classes = node.attributes["class"];
        if (classes) {
          for (let cls of classes.split(/\s+/)) {
            if (`.${cls}` in selectorDeclarations) {
              console.log("Filtering out fill:none element:", node.name, cls);
              // these look like empty, transparent shapes we can just remove
              parentNode.children = parentNode.children.filter((child) => child !== node);
            }
          }
        }
      }
    }
  }
};

