const express = require('express');
const Resource = require('resourcejs');
const defaultOptions = require('./defaultOptions');
const settingOptions = require('./settingOptions');

const Org = require('../orgModel');
const User = require('../userModel');
const Membership = require('../membershipModel');
const Setting = require('../settingModel');

const router = express.Router();

Resource(router, '', 'org', Org).rest(defaultOptions);
Resource(router, '', 'user', User).rest(defaultOptions);
Resource(router, '', 'membership', Membership).rest(defaultOptions);
Resource(router, '', 'setting', Setting).rest(settingOptions);

const app = express();
app.use('/v2', router);

module.exports = app;
