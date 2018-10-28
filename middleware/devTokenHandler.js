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
    req.user = req.query.token;

    // remove the query param so nothing downstream applies it to the query
    delete req.query.token;
  }

  next();
};
