const _ = require('lodash');
const Membership = require('./');

module.exports = (schema) => {
  const permissions = {
    creator: {
      create: true,
      write: ['org', 'user', 'roles', 'createAt', 'updatedAt'],
    },
    admin: {
      write: ['roles', 'updatedAt'],
      read: ['_id', 'id', 'org', 'user', 'roles', 'createdAt'],
      remove: true,
    },
    member: {
      read: ['_id', 'id', 'org', 'user', 'roles', 'createdAt'],
    },
    ownMembership: {
      remove: true,
    },
  };

  async function getAuthLevel(payload, doc) {
    const { userId, userMemberships } = payload;
    const membership = _.find(userMemberships, ['org', doc.org]);
    const levels = [];
    const isAdmin = _.includes(membership.roles, Membership.ROLES.Admin);
    const isMember = _.includes(membership.roles, Membership.ROLES.Member);
    const ownMembership = doc.user === userId;

    // User adding themselves to an org with no existing members (probably setting up
    // an org). Do the expensive check to see if there are no admins of this org
    if (
      doc.isNew
      && ownMembership
      && await Membership.countDocuments({ org: doc.org }).setAuthLevel(false).exec() === 0
    ) {
      levels.push('creator');
    }

    if (doc.isNew && isAdmin) levels.push('creator');
    if (isAdmin) levels.push('admin');
    if (isMember) levels.push('member');
    if (ownMembership) levels.push('ownMembership');

    return levels;
  }

  Object.assign(schema, { permissions, getAuthLevel });
};
