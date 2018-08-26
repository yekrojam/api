module.exports = (schema) => {
  schema.index({ org: 1 });
  schema.index({ user: 1 });
  schema.index({ org: 1, user: 1 }, { unique: true });
};
