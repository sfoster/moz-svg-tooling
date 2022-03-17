'use strict';
/*eslint strict:0*/

exports.type = 'perItem';

exports.active = true;

exports.name = "context-fill-stroke";
exports.description = 'Remove inline fill/stroke styles add add context-fill and context-stroke on the svg';
exports.params = {
  fill: "*",
  stroke: "*",
  opacity: 1,
};

exports.fn = function(item, params) {
  let contextColors = {};
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
  for (let attrName of ["fill", "stroke"]) {
    let attr = item.attr(attrName);
    if (!attr || attr.value === "none") {
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

  if (item.hasAttr("style")) {
    let styleValues = {};
    let properties = [];
    let styleAttr = item.attr("style");
    for (let property of styleAttr.value.split(/;\s*/)) {
      let [name, value] = property.split(/\s*:\s*/);
      value = value.toLowerCase();
      switch (name.toLowerCase()) {
        case "fill":
          if (value.toLowerCase() !== "none" && (params.fill == "*" || (value in contextColors))) {
            styleValues.fill = contextColors[value];
          }
          break;
        case "stroke":
          if (value.toLowerCase() !== "none" && (params.stroke == "*" || (value in contextColors))) {
            styleValues.stroke = contextColors[value];
          }
        case "opacity":
          if (value.toLowerCase() !== "none" && (params.opacity == "*" || value == params.opacity)) {
            styleValues.opacity = "context-opacity";
          }
        default: 
          properties.push(property);
      }
    }
    if (properties.length) {
      styleAttr.value = properties.join(";");
    } else {
      item.removeAttr("style");
    }
    // override attribute values with values from style
    for (let attrName of ["fill", "stroke", "opacity"]) {
      if (styleValues[attrName]) {
        let attr = item.attr(attrName);
        if (attr) {
          attr.value = styleValues[attrName];
        } else {
          item.addAttr({ name: attrName, local: attrName, value: styleValues[attrName], prefix: "" });
        }
      }
    }
  }
  return true;
}
