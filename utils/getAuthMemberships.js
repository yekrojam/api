const Membership = require('../membershipModel');

/**
 * EUsed in request middleware. Almost all of the authorization checks require that we
 * know which organizations the acting user is a member of. So we pre-fetch it
 * here so it's only done once. This is called on every API request, so we try
 * to get the minimal set of data and make it as light as possible.
 *
 * Extracted into a stand alone method so tests can easily use it
 */
module.exports = async userId => Membership.find({ user: userId })
  .setOptions({ authLevel: false })
  .select('org roles')
  .lean()
  .exec();
