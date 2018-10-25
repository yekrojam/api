const _ = require('lodash');
const defaultOptions = require('./defaultOptions');

/**
 * Resource is super aggressive at setting a 204 header if it thinks there
 * are no results...even from it doing a count query. Since the library
 * them empties out any results if the response code is 204 (even if we've
 * added some results in Mongoose middleware). So detect that case and fix
 * the response code here.
 */
function fixResponseCode(req, res, next) {
  if (res.resource.item.length) {
    res.resource.status = 200;
  }

  next();
}

// Add/merge our options into the default ones. Never overwrite a function from
// the default that needs to run, just add on.
const settingOptions = {
  ...defaultOptions,
  afterIndex: _.concat([fixResponseCode], defaultOptions.afterIndex),
};

module.exports = settingOptions;

