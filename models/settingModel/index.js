const Setting = require('./Setting');

// Include all of the discriminators so they get registered.
require('./discriminators/ApprovedCookieSetting');

module.exports = Setting;
