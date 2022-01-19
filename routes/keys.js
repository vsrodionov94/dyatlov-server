const { getCurrentDay, updateUserDay } = require('../functions/utils');
const User = require('../models/user');
const keys = require('../data/keys');
const twitchKeys = require('../data/twitchKeys');
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

      result.hasKey = Boolean(keys[currentDay]) && !user.tvKeyAnswered;
      result.hasKey = result.hasKey || user.answerTwitch.length < twitchKeys.length;

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
      const checkTwitchKey = user.answerTwitch.some(el => el === answer);
      if (result.tryCount < MAX_ACTIONS_COUNT && answer !== '') {
        if (!user.tvKeyAnswered && dailyKey === answer) {
          result.tryCount += 1;
          result.correctly = true;
          result.keys += 1;
          User.updateOne(
            { vkId },
            { $inc: { keys: 1, tryKeyCount: 1 }, $set: { tvKeyAnswered: true } },
          ).then(() => null);
          Statistics.incKeysCount();
        } else if (!checkTwitchKey && twitchKeys.some(el => el === answer)) {
          result.tryCount += 1;
          result.correctly = true;
          result.keys += 1;
          User.updateOne(
            { vkId },
            {
              $inc: { keys: 1, tryKeyCount: 1 },
              $set: { answerTwitch: user.answerTwitch.concat(answer) },
            },
          ).then(() => null);
        } else {
          result.tryCount += 1;
          User.updateOne({ vkId }, { $inc: { tryKeyCount: 1 } }).then(() => null);
        }
      }
    } else result.error = true;

    res.json(result);
  });
};

module.exports = { checkKey, tryAnswerKey };
