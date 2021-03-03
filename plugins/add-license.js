'use strict';

exports.type = 'full';
exports.active = true;
exports.description = 'adds the mozilla license to the document';
exports.name = "add-license";

const licenseText = ` This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at http://mozilla.org/MPL/2.0/. `;

/**
 * Add a license comment
 *
 * @author Sam Foster
 */
exports.fn = function(data, params) {
  data.content.unshift({
    comment: licenseText
  });
  return data;
};
