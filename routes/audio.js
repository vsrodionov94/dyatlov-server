const { getCurrentDay, updateUserDay } = require('../functions/utils');
const User = require('../models/user');
const audio = require('../data/audio');
const Statistics = require('../classes/Statistics');

const INC_ARTIFACTS = 5;

const checkAudio = app => {
  app.post('/checkAudio', async (req, res) => {
    const result = {
      error: false,
      hasAudio: false,
      tryCount: 0,
      currentDay: 1,
    };

    const { vkId } = req.body;

    const user = await User.findOne({ vkId }).then(found => found);

    if (user) {
      const currentDay = getCurrentDay();

      if (currentDay !== user.lastDay) updateUserDay(vkId, currentDay);
      else result.tryCount = user.tryAudioCount;

      result.hasAudio = Boolean(audio[currentDay]);
      result.currentDay = currentDay;
    } else result.error = true;

    res.json(result);
  });
};

const tryAnswerAudio = app => {
  app.post('/tryAnswerAudio', async (req, res) => {
    const result = {
      error: false,
      correctly: false,
      artifacts: 0,
      tryCount: 0,
    };

    const { vkId, answer } = req.body;

    const user = await User.findOne({ vkId }).then(found => found);

    if (user) {
      const currentDay = getCurrentDay();
      result.artifacts = user.artifacts;
      if (currentDay !== user.lastDay) updateUserDay(vkId, currentDay);
      else result.tryCount = user.tryAudioCount;
      const dailyAudio = audio[currentDay];

      if (dailyAudio) {
        if (result.tryCount >= 0 && result.tryCount < 3) {
          if (dailyAudio === answer.toUpperCase()) {
            result.tryCount = -1;
            result.correctly = true;
            result.artifacts += INC_ARTIFACTS;
            Statistics.incAudioCount();
            User.updateOne(
              { vkId },
              { $inc: { artifacts: INC_ARTIFACTS }, $set: { tryAudioCount: -1 } },
            ).then(() => null);
          } else {
            result.tryCount += 1;
            User.updateOne({ vkId }, { $inc: { tryAudioCount: 1 } }).then(() => null);
          }
        }
      }
    } else result.error = true;

    res.json(result);
  });
};

module.exports = { checkAudio, tryAnswerAudio };
