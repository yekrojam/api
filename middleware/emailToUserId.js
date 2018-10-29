const _ = require('lodash');
const User = require('../userModel');

/**
 * Just after authenticating, clients may only have verified the user's
 * email address and don't yet have their id. This allows them to create
 * a token that contain the email address and this middleware will look up
 * the email address and add the correct id to `req.user` so further downstream
 * authz checks will work.
 */
module.exports = async function emailToUserId(req, res, next) {
  const { user: { id, email } } = req;
  if (id || !email) return next();

  const { _id: userId } = await User.findOne({ email }, '_id').exec();
  _.set(req, 'user.id', userId);

  return next();
};
