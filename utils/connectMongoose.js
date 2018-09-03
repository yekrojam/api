const mongoose = require('mongoose');
const debug = require('debug')('majorkey:apiServer:dbConnection');

const { NODE_ENV, MONGO_URI } = process.env;

const connectOptions = {
  useNewUrlParser: true,
};

module.exports = async () => {
  try {
    await mongoose.connect(MONGO_URI, connectOptions);
  } catch (err) {
    debug(err);
  }
};
