module.exports = (req, res) => {
  if (!res.headersSent) {
    res.status(404).json({
      status: 404,
      errors: ['Resource not found'],
    });
  }
};
