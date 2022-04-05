'use strict';
/*eslint strict:0*/

exports.type = 'visitor';

exports.active = true;

exports.name = "context-fill-stroke";
exports.description = 'Remove inline fill/stroke styles add add context-fill and context-stroke on the svg';
exports.params = {
  fill: "*",
  stroke: "*",
  opacity: 1,
};

exports.fn = (root, params) => {
  // collect together the fill/stroke colors we want to replace with
  // the context-fill / context-stroke
  const contextColors = {};
  for (let attrName of ["fill", "stroke"]) {
    let value = params[attrName];
    if (!value || value == "*") {
      continue;
    }
    if (!Array.isArray(value)) {
      value = [value];
    }
    for (let color of value) {
      contextColors[color] = "context-" + attrName;
    }
  }
  console.log("contextColors:", contextColors);

  return {
    element: {
      enter: (node, parentNode) => {
        for (let attrName of ["fill", "stroke", "opacity"]) {
          let attr = node.attributes[attrName];
          if (!attr) {
            continue;
          }
          if (attrName == "opacity") {
            if (attr.value == params.opacity) {
              attr.value = "context-opacity";
            }
          } else if (attr.value in contextColors) {
            attr.value = contextColors[attr.value];
          }
        }

        const styleAttr = node.attributes.style;
        if (!styleAttr) {
          return;
        }
        let styleValues = {};
        let properties = [];
        for (let property of styleAttr.split(/;\s*/)) {
          let [name, value] = property.split(/\s*:\s*/).map(s => s.trim());
          value = value.toLowerCase();
          switch (name.toLowerCase()) {
            case "fill":
              if (value !== "none" && (params.fill == "*" || (value in contextColors))) {
                styleValues.fill = contextColors[value];
              }
              break;
            case "stroke":
              if (value !== "none" && (params.stroke == "*" || (value in contextColors))) {
                styleValues.stroke = contextColors[value];
              }
              break;
            case "opacity":
              if (value !== "none" && (params.opacity == "*" || value == params.opacity)) {
                styleValues.opacity = "context-opacity";
              }
              break;
            default:
              properties.push(property);
          }
        }
        console.log("style properties: ", properties);
        if (properties.length) {
          node.attributes.style = properties.join(";");
        } else {
          console.log("removing style, no properties in ", node.attributes.d);
          node.removeAttr("style");
        }
        // override attribute values with values from style
        for (let attrName of ["fill", "stroke", "opacity"]) {
          if (styleValues[attrName]) {
            let attr = node.attributes[attrName];
            node.attributes[attrName] = "" + styleValues[attrName];
          }
        }
      }
    }
  }
}
