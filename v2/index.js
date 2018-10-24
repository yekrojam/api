const express = require('express');
const Resource = require('resourcejs');
const defaultOptions = require('./defaultOptions');

const Org = require('../orgModel');
const User = require('../userModel');
const Membership = require('../membershipModel');

const router = express.Router();

Resource(router, '', 'org', Org).rest(defaultOptions);
Resource(router, '', 'user', User).rest(defaultOptions);
Resource(router, '', 'membership', Membership).rest(defaultOptions);

const app = express();
app.use('/v2', router);

module.exports = app;
