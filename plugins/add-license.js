'use strict';

const JSAPI = require('svgo/lib/svgo/jsAPI.js');

exports.type = 'visitor';
exports.active = true;
exports.description = 'adds the mozilla license to the document';
exports.name = "add-license";

const licenseText = ` This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at http://mozilla.org/MPL/2.0/.`;

exports.fn = function() {
  return {
    root: {
      // enter: (node) => {
      //   console.log("add-license, got node:", node.type, node);
      //   return node;
      // },
      exit: (node) => {
        node.children.unshift( new JSAPI({
          type: "comment",
          value: licenseText,
        }));
      }
    }
  }
};
