const Stats = require('../models/stats');
const Users = require('../models/user');

module.exports = app => {
  app.get('/getStats', async (req, res) => {
    res.json({ });
  });
};
