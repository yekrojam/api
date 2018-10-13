const getAuthMemberships = require('../utils/getAuthMemberships');

/**
 * Middleware wrapper of getAuthMemberships. Stores the list of memberships
 * for the acting user in the request
 */
module.exports = async (req, res, next) => {
  const userMemberships = (req.user && req.user.id)
    ? await getAuthMemberships(req.user.id)
    : [];
  Object.assign(req, { userMemberships });

  next();
};
