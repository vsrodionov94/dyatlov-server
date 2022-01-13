const User = require('../models/user');
const { getCurrentDay, updateUserDay } = require('../functions/utils');

module.exports = app => {
  app.post('/checkUser', async (req, res) => {
    const { vkId } = req.body;
    const result = {
      tutorial: false,
      keys: 0,
      artifacts: 0,
      inviteCount: 0,
    };

    const user = await User.findOne({ vkId }).then(data => data);
    const currentTime = Math.round(new Date().getTime() / 1000);
    const currentDay = getCurrentDay();
    if (currentTime > process.env.END_DAY || currentTime < process.env.START_DAY) res.json({});

    if (user) {
      result.tutorial = user.tutorial;
      if (user.lastDay < currentDay) {
        updateUserDay(vkId, currentDay);
      } else {
        Object.keys(result).forEach(key => { result[key] = user[key]; });
      }
    } else {
      User.create({ vkId: vkId }).then(() => null);
    }

    res.json(result);
  });
};
