const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const methodOverride = require('method-override');
const restify = require('express-restify-mongoose');
const compression = require('compression');
const helmet = require('helmet');
const http = require('http');
const restifyOptions = require('./utils/restifyOptions');

require('./utils/connectMongoose')();

const Org = require('./orgModel');
const User = require('./userModel');
const Membership = require('./membershipModel');

const IS_PROD = process.env.NODE_ENV === 'production';

const router = express.Router();
restify.serve(router, Org, restifyOptions);
restify.serve(router, User, restifyOptions);
restify.serve(router, Membership, restifyOptions);

/**
 * One-off route for logging in. Find the user and update if they exist, or
 * create if they don't.
 */
router.post('/api/v1/login', async (req, res, next) => {
  try {
    const { auth } = req.body;
    const users = await User.find({ auth });

    const user = users && users.length ?
      users[0] :
      await User.create(req.body);

    res.send(user);
  } catch (error) {
    next(error);
  }
});

const app = express();
app.use(methodOverride());
app.use(bodyParser.json());
app.use(helmet());
app.use(cors({
  // `true` enables open access while `false` restricts to the current origin.
  origin: !IS_PROD,
}));
app.use(compression());
app.use(router);
app.use((req, res) => {
  res.status(404).json({ message: http.STATUS_CODES[404] });
});

module.exports = app;
