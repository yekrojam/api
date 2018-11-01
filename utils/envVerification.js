const Joi = require('joi');
/**
 * Verifies which environment variables are required, present and well formed
 */
module.exports = {
  verify() {
    const schema = {
      MONGODB_URI: Joi.string().uri().required(),
      NODE_ENV: Joi.valid('production', 'development', 'test').required(),
      DEBUG: Joi.string(),
      JWT_SECRET: Joi.string().required(),
      SENTRY_DSN: Joi.string().uri(),
    };

    const result = Joi.validate(
      process.env,
      schema,
      { abortEarly: false, allowUnknown: true },
    );
    if (result.error) throw result.error;
  },
};
