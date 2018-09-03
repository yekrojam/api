const mongoose = require('mongoose');
const phoneParser = require('phone');
const validator = require('validator');

const userIndex = require('./userIndex');
const userValidation = require('./userValidation');
const userPermissions = require('./userPermissions');
const baseSchemaPlugin = require('../utils/baseSchemaPlugin');

const userSchema = new mongoose.Schema({
  /**
   * Id used for authentication.
   */
  auth: String,
  urlSlug: String,
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    set(email) { return validator.normalizeEmail(email); },
  },
  phone: {
    type: String,
    trim: true,
    set(phone) { return phoneParser(phone, 'USA')[0]; },
  },
  gender: String,
  birthYear: {
    type: Number,
    set: Math.floor,
  },
  birthMonth: {
    type: Number,
    set: Math.floor,
  },
  birthDate: {
    type: Number,
    set: Math.floor,
  },
  imageURL: String,
  funImageURL: String,
});

userSchema.plugin(userIndex);
userSchema.plugin(userValidation);
userSchema.plugin(userPermissions);
userSchema.plugin(baseSchemaPlugin);

module.exports = mongoose.model('User', userSchema);
