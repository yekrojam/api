module.exports = function getQueryOpts(req) {
  return {
    authPayload: {
      userId: req.user.id,
      userMemberships: req.userMemberships,
    },
    permissions: true,
  };
};
