const express = require('express');
const router = express.Router();

module.exports = (isAuthenticated, db, web3) => {
  router.use('/users', require('./users')(db, isAuthenticated, web3));
  return router;
};
