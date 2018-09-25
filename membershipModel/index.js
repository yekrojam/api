const mongoose = require('mongoose');
const membershipValidation = require('./membershipValidation');
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

membershipSchema.index({ org: 1 });
membershipSchema.index({ user: 1 });
membershipSchema.index({ org: 1, user: 1 }, { unique: true });

membershipSchema.plugin(membershipValidation);
membershipSchema.plugin(membershipPermissions);
membershipSchema.plugin(baseSchemaPlugin);

module.exports = mongoose.model('Membership', membershipSchema);
