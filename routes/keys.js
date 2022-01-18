const { getCurrentDay, updateUserDay } = require('../functions/utils');
const User = require('../models/user');
const keys = require('../data/keys');
const Statistics = require('../classes/Statistics');
const { MAX_ACTIONS_COUNT } = require('../data/constants');

const checkKey = app => {
  app.post('/checkKey', async (req, res) => {
    const result = {
      error: false,
      hasKey: false,
      tryCount: 0,
      currentDay: 0,
    };

    const { vkId } = req.body;

    const user = await User.findOne({ vkId }).then(found => found);

    if (user) {
      const currentDay = getCurrentDay();

      if (currentDay !== user.lastDay) updateUserDay(vkId, currentDay);
      else result.tryCount = user.tryKeyCount;

      result.hasKey = Boolean(keys[currentDay]);
      result.currentDay = currentDay;
    } else result.error = true;

    res.json(result);
  });
};

const tryAnswerKey = app => {
  app.post('/tryAnswerKey', async (req, res) => {
    const result = {
      error: false,
      correctly: false,
      keys: 0,
      tryCount: 0,
    };

    const { vkId, answer } = req.body;

    const user = await User.findOne({ vkId }).then(found => found);

    if (user) {
      const currentDay = getCurrentDay();
      result.keys = user.keys;
      if (currentDay !== user.lastDay) updateUserDay(vkId, currentDay);
      else result.tryCount = user.tryKeyCount;
      const dailyKey = keys[currentDay];

      if (dailyKey) {
        if (result.tryCount >= 0 && result.tryCount < MAX_ACTIONS_COUNT) {
          if (dailyKey === answer) {
            result.tryCount = -1;
            result.correctly = true;
            result.keys += 1;
            User.updateOne({ vkId }, { $inc: { keys: 1 }, $set: { tryKeyCount: -1 } })
              .then(() => null);
            Statistics.incKeysCount();
          } else {
            result.tryCount += 1;
            User.updateOne({ vkId }, { $inc: { tryKeyCount: 1 } })
              .then(() => null);
          }
        }
      }
    } else result.error = true;

    res.json(result);
  });
};

module.exports = { checkKey, tryAnswerKey };
