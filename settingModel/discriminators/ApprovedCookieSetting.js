const mongoose = require('mongoose');
const Setting = require('../Setting');

const ApprovedCookieSetting = Setting.discriminator(
  'ApprovedCookieSetting',
  new mongoose.Schema({
    value: {
      type: Boolean,
      default: false,
    },
  }),
);

ApprovedCookieSetting.schema.path('targetRef').default('User');

module.exports = ApprovedCookieSetting;
