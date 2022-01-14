const {
  getCurrentDay,
  updateUserDay,
  getUserInfo,
  randomInt,
  parseUserData,
  incUserArtefacts,
  incUserArtefactsAndTryCount,
} = require('../functions/utils');
const User = require('../models/user');

const {
  INC_HELPED,
  INC_INTERFERE,
} = require('../data/constants');

const getUserForAnswer = app => {
  app.post('/getUserForAnswer', async (req, res) => {
    const result = {
      error: false,
      tryCount: 0,
      user: null,
    };

    const { vkId } = req.body;

    const user = await User.findOne({ vkId }).then(found => found);

    if (user) {
      const currentDay = getCurrentDay();
      if (currentDay !== user.lastDay) updateUserDay(vkId, currentDay);
      else result.tryCount = user.tryUserAnswerCount;

      const { usersForAnswer } = user;
      if (usersForAnswer.length > 0) {
        const randomIndex = randomInt(0, usersForAnswer.length);
        const userData = await getUserInfo(usersForAnswer[randomIndex].id)
          .then(response => parseUserData(response.data.response[0]));
        result.user = userData;
      }
    } else result.error = true;

    res.json(result);
  });
};

const tryAnswerUser = app => {
  app.post('/tryAnswerUser', async (req, res) => {
    const result = {
      error: false,
      tryCount: 0,
      artifacts: 0,
    };

    const { vkId, foreignId, answer } = req.body;

    const user = await User.findOne({ vkId }).then(found => found);

    if (user) {
      const currentDay = getCurrentDay();
      if (currentDay !== user.lastDay) updateUserDay(vkId, currentDay);
      else result.tryCount = user.tryUserAnswerCount;
      result.artifacts = user.artifacts;
      const { usersForAnswer } = user;
      const foreignUser = usersForAnswer.find(el => el.id === Number(foreignId));
      if (foreignUser) {
        if (foreignUser.helped) {
          incUserArtefacts(foreignUser.id, INC_HELPED);
          if (answer) {
            incUserArtefactsAndTryCount(vkId, INC_HELPED);
            result.artifacts += INC_HELPED;
          }
        } else if (answer) {
          incUserArtefacts(foreignUser.id, INC_INTERFERE);
          incUserArtefactsAndTryCount(vkId, -INC_HELPED);
          result.artifacts -= INC_HELPED;
        } else {
          incUserArtefacts(foreignUser.id, -INC_HELPED);
          incUserArtefactsAndTryCount(vkId, INC_INTERFERE);
          result.artifacts += INC_INTERFERE;
        }
        result.tryCount += 1;
      } else result.error = true;
    } else result.error = true;

    res.json(result);
  });
};

module.exports = { getUserForAnswer, tryAnswerUser };
