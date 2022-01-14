const User = require('../models/user');

module.exports = app => {
  app.post('/doneTutorial', (req, res) => {
    const { vkId } = req.body;
    User.updateOne({ vkId }, { $set: { tutorial: true } }).then(() => null);
    res.json({});
  });
};
