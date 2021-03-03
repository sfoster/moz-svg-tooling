#!/bin/bash

wd=$(dirname -- $(readlink -fn -- "$0"))
# use plugin config from icons.config.js
# edit each file in-place
svgo "$@" --config $wd/icons.config.js
