const _ = require('lodash');
const Membership = require('../membershipModel');

function orgsWithRole(memberships, role) {
  return _.chain(memberships)
    .filter(mem => _.includes(mem.roles, role))
    .map('org')
    .value();
}

const FULL_READ_PERMS = ['_id', 'id', 'name', 'email', 'phone', 'gender', 'birthYear', 'birthMonth', 'birthDate', 'imageURL', 'funImageURL', 'createdAt'];

module.exports = (schema) => {
  const permissions = {
    creator: {
      create: true,
      write: ['name', 'email', 'phone', 'gender', 'birthYear', 'birthMonth', 'birthDate', 'imageURL', 'funImageURL', 'createdAt', 'updatedAt'],
    },
    self: {
      write: ['name', 'email', 'phone', 'gender', 'birthYear', 'birthMonth', 'birthDate', 'imageURL', 'funImageURL', 'updatedAt'],
    },
    orgMember: {
      read: FULL_READ_PERMS,
    },
    adminOfSingleOrgMember: {
      read: FULL_READ_PERMS,
      write: ['name', 'email', 'phone', 'gender', 'birthYear', 'birthMonth', 'birthDate', 'imageURL', 'funImageURL', 'updatedAt'],
    },
    adminOfMultiOrgMember: {
      read: FULL_READ_PERMS,
      write: ['name', 'email', 'gender', 'updatedAt'],
    },
  };

  async function getAuthLevel(payload, doc) {
    const levels = [];

    const adminedOrgs = orgsWithRole(payload.userMemberships, Membership.ROLES.Admin);

    if (doc.isNew) {
      // Sweet, we must be creating
      // You can be a creator is you're either logged out (making your own
      // account) or you're ad admin of at least one org (you're adding someone)
      if (!payload.userId || adminedOrgs.length > 0) {
        levels.push('creator');
      }
    } else if (payload.userId) {
      if (payload.userId === doc._id) {
        levels.push('self', 'orgMember'); // of course you are in the same org as yourself
      } else {
        const targetUserMemberships = await Membership.find({ user: doc._id }, 'org roles')
          .lean()
          .setOptions({ authLevel: false }) // internal, skip auth
          .exec();

        if (_.intersectionBy(targetUserMemberships, payload.userMemberships, 'org').length) {
          levels.push('orgMember');
        }

        const targetMemberOrgs = orgsWithRole(targetUserMemberships, Membership.ROLES.Member);

        if (adminedOrgs.length === 1 &&
          targetMemberOrgs.length === 1 &&
          adminedOrgs[0] === targetMemberOrgs[0]) {
        // The user and admin are only in one org, so you have more control
          levels.push('adminOfSingleOrgMember');
        } else if (_.intersection(adminedOrgs, targetMemberOrgs).length) {
          levels.push('adminOfMultiOrgMember');
        }
      }
    }

    return levels;
  }

  Object.assign(schema, { permissions, getAuthLevel });
};
