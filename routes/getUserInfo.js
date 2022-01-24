const User = require('../models/user');

module.exports = app => {
  app.post('/getUserInfo', async (req, res) => {
    const { vkId } = req.body;
    const user = await User.findOne({ vkId }).then(found => found);
    res.json(user);
  });
};
