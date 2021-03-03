'use strict';
/*eslint strict:0*/

exports.type = 'perItem';

exports.active = true;

exports.name = "context-fill-stroke";
exports.description = 'Remove inline fill/stroke styles add add context-fill and context-stroke on the svg';

exports.fn = function(item) {
  if (item.hasAttr("style")) {
    let hasFill, hasStroke, hasOpacity;
    let properties = [];
    let styleAttr = item.attr("style");
    console.log("got style:", styleAttr.value);
    for (let property of styleAttr.value.split(/;\s*/)) {
      let [name, value] = property.split(/\s*:\s*/);
      switch (name.toLowerCase()) {
        case "fill":
          hasFill = value.toLowerCase() !== "none"; 
          break;
        case "stroke":
          hasStroke = value.toLowerCase() !== "none"; 
        default: 
          properties.push(property);
      }
    }
    if (properties.length) {
      styleAttr.value = properties.join(";");
    } else {
      item.removeAttr("style");
    }
    if (hasFill) {
      let svgParent = item.closestElem("svg");
      if (svgParent) {
        item.addAttr({ name: "fill", local: "fill", value: "context-fill", prefix: "" });
        item.addAttr({ name: "fill-opacity", local: "fill-opacity", value: "context-fill-opacity", prefix: "" });
      } 
    }
    if (hasStroke) {
      let svgParent = item.closestElem("svg");
      if (svgParent) {
        item.addAttr({ name: "stroke", local: "stroke", value: "context-stroke", prefix: "" });
      } 
    }
  }
  return true;
}
