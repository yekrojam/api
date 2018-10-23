module.exports = function getQueryOpts(req) {
  return {
    authPayload: {
      userId: req.user.id,
    },
    permissions: true,
  };
};
