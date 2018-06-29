const mongoose = require('mongoose');
const debug = require('debug')('mongoose connection');

const { NODE_ENV, MONGO_URI } = process.env;
const isProd = NODE_ENV === 'production';
const isDev = NODE_ENV === 'development';
const accessLiveData = isProd || isDev;

module.exports = () => {
  mongoose.connect(
    accessLiveData ? MONGO_URI : 'http://localhost:5000',
    err => err && debug(err),
  );
};
