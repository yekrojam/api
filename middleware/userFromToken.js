const _ = require('lodash');
const jwt = require('express-jwt');
const Sentry = require('@sentry/node');
const { series } = require('middleware-flow');

const { User } = require('../models');

/**
 * For development, loads a plain text auth token from the query params.
 * This makes experimenting with the API faster from a browser
 */
function devTokenHandler(req, res, next) {
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
}

/**
 * Just after authenticating, clients may only have verified the user's
 * email address and don't yet have their id. This allows them to create
 * a token that contain the email address and this middleware will look up
 * the email address and add the correct id to `req.user` so further downstream
 * authz checks will work.
 */
async function emailToUserId(req, res, next) {
  const { user: { id, email } } = req;
  if (id || !email) return next();

  const user = await User
    .findOne({ email }, '_id')
    .setAuthLevel(false)
    .exec();

  if (user && user._id) {
    _.set(req, 'user.id', user._id);
  }

  return next();
}

function setSentryUserScope(req, res, next) {
  Sentry.configureScope((scope) => {
    scope.setUser(req.user);
  });
  next();
}

module.exports = series(
  devTokenHandler,
  jwt({ secret: process.env.JWT_SECRET }).unless(req => !!req.user),
  emailToUserId,
  setSentryUserScope,
);
