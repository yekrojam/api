module.exports = (schema) => {
  schema.path('org')
    .required(true, 'A membership must specify an organization');

  schema.path('user')
    .required(true, 'A membership must specify an user');
};
