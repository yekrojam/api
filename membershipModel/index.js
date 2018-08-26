const mongoose = require('mongoose');
const membershipValidation = require('./membershipValidation');
const membershipIndex = require('./membershipIndex');
const membershipPermissions = require('./membershipPermissions');
const baseSchemaPlugin = require('../utils/baseSchemaPlugin');

const membershipSchema = new mongoose.Schema({
  org: {
    type: String,
    ref: 'Org',
  },
  user: {
    type: String,
    ref: 'User',
  },
  roles: [{
    type: String,
    enum: ['MEMBER', 'ADMIN'],
  }],
});

membershipSchema.plugin(membershipIndex);
membershipSchema.plugin(membershipValidation);
membershipSchema.plugin(membershipPermissions);
membershipSchema.plugin(baseSchemaPlugin);

module.exports = mongoose.model('Membership', membershipSchema);
