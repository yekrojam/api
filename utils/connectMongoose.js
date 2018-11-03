const mongoose = require('mongoose');
const debug = require('debug')('majorkey2api:dbConnection');

const { NODE_ENV, MONGODB_URI } = process.env;
const isProd = NODE_ENV === 'production';
const isDev = NODE_ENV === 'development';
const accessLiveData = isProd || isDev;
const URIToUse = accessLiveData ? MONGODB_URI : 'http://localhost:27017';
const connectOptions = {
  useNewUrlParser: true,
};

module.exports = async () => {
  try {
    await mongoose.connect(URIToUse, connectOptions);
    debug('Connected to DB');
  } catch (err) {
    debug(err);
  }
};
