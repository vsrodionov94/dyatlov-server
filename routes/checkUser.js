const User = require('../models/user');
const {
  getCurrentDay,
  updateUserDay,
  checkRefAndUpdate,
  checkEventTime,
} = require('../functions/utils');
const Statistics = require('../classes/Statistics');

module.exports = app => {
  app.post('/checkUser', async (req, res) => {
    const { vkId, ref } = req.body;
    const result = {
      tutorial: false,
      keys: 0,
      artifacts: 0,
      inviteCount: 0,
    };
    console.log(ref);

    const user = await User.findOne({ vkId }).then(data => data);
    const currentDay = getCurrentDay();
    if (!checkEventTime()) return res.json({});

    if (user) {
      result.tutorial = user.tutorial;
      if (user.lastDay < currentDay) {
        updateUserDay(vkId, currentDay);
      } else {
        Object.keys(result).forEach(key => { result[key] = user[key]; });
      }
    } else {
      User.create({ vkId: vkId }).then(() => null);
      checkRefAndUpdate(Number(ref));
      Statistics.incUsersCount();
    }

    Statistics.incOpenedCount();
    return res.json(result);
  });
};
