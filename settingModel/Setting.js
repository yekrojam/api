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
    type: String,
    required: [true, 'You must use a specific setting type'],
    set() { throw new Error('You must use a specific setting type'); },
  },
});

settingSchema.set('discriminatorKey', 'kind');

// There should only be one setting of each kind for any given object.
settingSchema.index({ target: 1, kind: 1 }, { unique: true });

settingSchema.plugin(settingValidation);
settingSchema.plugin(settingHooks);
settingSchema.plugin(settingPermissions);
settingSchema.plugin(baseSchemaPlugin);

module.exports = mongoose.model('Setting', settingSchema);
