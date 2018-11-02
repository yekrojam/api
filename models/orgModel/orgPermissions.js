const _ = require('lodash');
const Membership = require('../membershipModel');

module.exports = (schema) => {
  const permissions = {
    creator: {
      create: true,
      write: ['urlSlug', 'name', 'description', 'navImg', 'squareImg', 'createdAt', 'updatedAt'],
    },
    admin: {
      write: ['name', 'description', 'navImg', 'squareImg'],
      read: ['_id', 'id', 'urlSlug', 'name', 'description', 'navImg', 'squareImg'],
    },
    member: {
      read: ['_id', 'id', 'urlSlug', 'name', 'description', 'navImg', 'squareImg'],
    },
  };

  function getAuthLevel(payload, doc) {
    const { userId, userMemberships } = payload;
    const levels = [];

    const adminedOrgs = _.chain(userMemberships)
      .filter(mem => _.includes(mem.roles, Membership.ROLES.Admin))
      .map('org')
      .value();
    const memberedOrgs = _.chain(userMemberships)
      .filter(mem => _.includes(mem.roles, Membership.ROLES.Member))
      .map('org')
      .value();

    // Only logged in users can do things
    if (userId) {
      if (doc.isNew) levels.push('creator'); // Any logged in user can make an org
      if (_.includes(memberedOrgs, doc.id)) levels.push('member');
      if (_.includes(adminedOrgs, doc.id)) levels.push('admin');
    }

    return levels;
  }

  Object.assign(schema, { permissions, getAuthLevel });
};
