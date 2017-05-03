"use strict";

const marked = require("marked");
const loaderUtils = require("loader-utils");

module.exports = function (markdown) {
  // merge params and default config
  const options = loaderUtils.parseQuery(this.query);

  this.cacheable();

  marked.setOptions(options);

  const output = JSON.stringify(marked(markdown))
  return `module.exports = ${output}`;
};

module.exports.seperable = true;
