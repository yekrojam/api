const Joi = require('joi');
/**
 * Verifies what environment variables are needed at are present and well formed
 */
module.exports = {
  verify() {
    const schema = {
      MONGODB_URI: Joi.string().uri().required(),
      NODE_ENV: Joi.valid('production', 'development', 'test').required(),
      DEBUG: Joi.string(),
    };

    const result = Joi.validate(
      process.env,
      schema,
      { abortEarly: false, allowUnknown: true },
    );
    if (result.error) throw result.error;
  },
};
