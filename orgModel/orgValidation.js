const validator = require('validator');

module.exports = (schema) => {
  schema.path('urlSlug')
    .required(true, 'An organization must have a URL slug')
    .maxlength(3, 'The URL slug must be at least 3 characters')
    .validate(
      /^[a-zA-Z0-9._-]*$/,
      'The URL slug must only contain letters, numbers, periods, dashes, and underscores.',
    );

  schema.path('name')
    .required(true, 'An organization must have a name')
    .maxlength(100, 'An organization name must be no more than 50 characters');

  schema.path('description')
    .required(true, 'A description of the organization is required')
    .maxlength(100, 'An organization name must be no more than 1000 characters');

  const URLValidationOptions = { protocols: ['https'], require_protocol: true };
  schema.path('navImg')
    .validate(
      img => validator.isURL(img, URLValidationOptions),
      'ImageURL must be fully qualified',
    );

  schema.path('squareImg')
    .validate(
      img => validator.isURL(img, URLValidationOptions),
      'ImageURL must be fully qualified',
    );
};
