const mongoose = require('mongoose');
const orgValidation = require('./orgValidation');
const orgIndex = require('./orgIndex');
const orgPermissions = require('./orgPermissions');
const baseSchemaPlugin = require('../utils/baseSchemaPlugin');

const orgSchema = new mongoose.Schema({
  urlSlug: {
    type: String,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  navImg: String,
  squareImg: String,
});

orgSchema.plugin(orgIndex);
orgSchema.plugin(orgValidation);
orgSchema.plugin(orgPermissions);
orgSchema.plugin(baseSchemaPlugin);

module.exports = mongoose.model('Org', orgSchema);
