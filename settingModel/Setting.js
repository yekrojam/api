const mongoose = require('mongoose');
const settingValidation = require('./settingValidation');
const settingPermissions = require('./settingPermissions');
const settingHooks = require('./settingHooks');
const baseSchemaPlugin = require('../utils/baseSchemaPlugin');

const settingSchema = new mongoose.Schema({
  target: {
    type: String,
    refPath: 'targetRef',
  },
  targetRef: {
    type: String,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
  },
});

settingSchema.set('discriminatorKey', 'kind');

// There should only be one setting of each kind for any given object.
settingSchema.index({ kind: 1, target: 1 }, { unique: true });

// You can lookup values for a certain kind
settingSchema.index({ kind: 1, value: 1 });

settingSchema.plugin(settingValidation);
settingSchema.plugin(settingHooks);
settingSchema.plugin(settingPermissions);
settingSchema.plugin(baseSchemaPlugin);

module.exports = mongoose.model('Setting', settingSchema);
