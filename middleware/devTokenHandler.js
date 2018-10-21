/**
 * For development, loads a plain text auth token from the query params.
 * This makes experimenting with the API faster from a browser
 */
module.exports = (req, res, next) => {
  if (
    process.env.NODE_ENV === 'development'
    && req.query.token
    && !req.user
  ) {
    req.user = JSON.parse(req.query.token);
  }

  next();
};
