const express = require('express');
const restify = require('express-restify-mongoose');

const restifyOptions = require('./restifyOptions');

const {
  Org, User, Membership,
} = require('../models');

const router = express.Router();
restify.serve(router, Org, restifyOptions);
restify.serve(router, User, restifyOptions);
restify.serve(router, Membership, restifyOptions);

module.exports = router;
