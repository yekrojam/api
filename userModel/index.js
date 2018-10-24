const mongoose = require('mongoose');
const phoneParser = require('phone');
const validator = require('validator');
const md5 = require('md5');

const userValidation = require('./userValidation');
const userPermissions = require('./userPermissions');
const baseSchemaPlugin = require('../utils/baseSchemaPlugin');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    set(email) { return validator.normalizeEmail(email); },
  },
  phone: {
    type: String,
    trim: true,
    set(phone) { return phoneParser(phone, 'USA')[0]; },
  },
  gender: {
    type: String,
    trim: true,
  },
  birthYear: Number,
  birthMonth: Number,
  birthDate: Number,
  imageURL: {
    type: String,
    trim: true,
  },
  funImageURL: {
    type: String,
    trim: true,
  },
});

userSchema.virtual('defaultedImageURL').get(function getDefaultedImageURL() {
  if (this.imageURL) { return this.imageURL; }

  return `https://s.gravatar.com/avatar/${md5(this.email || '')}?d=identicon&s=480`;
});

userSchema.index({ birthMonth: 1, birthDate: 1 });

userSchema.plugin(userValidation);
userSchema.plugin(userPermissions);
userSchema.plugin(baseSchemaPlugin);

module.exports = mongoose.model('User', userSchema);
