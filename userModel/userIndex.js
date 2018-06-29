module.exports = (schema) => {
  schema.index({ urlSlug: 1 }, { unique: 1 });
  schema.index({ email: 1 }, { unique: 1 });
  schema.index({ birthMonth: 1, birthDate: 1 });
};
