const http = require('http');

module.exports = (req, res) => {
  res.status(404).json({ message: http.STATUS_CODES[404] });
};
