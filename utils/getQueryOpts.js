module.exports = function getQueryOpts(req) {
  const queryOpts = {
    authPayload: {
      userId: req.user.id,
      userMemberships: req.userMemberships,
    },
    permissions: true,
  };

  if (req.method === 'GET') {
    queryOpts.lean = { virtuals: true };
  }

  return queryOpts;
};
