module.exports = (schema) => {
  schema.path('target')
    .required(true, 'A target object id must be specified');

  schema.path('targetRef')
    .required(true, 'The type of the target object is required and should be set automatically');

  schema.path('value')
    .required(true, 'A setting must have a value');
};
