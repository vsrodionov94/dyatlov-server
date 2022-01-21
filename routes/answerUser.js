const {
  getCurrentDay,
  updateUserDay,
  getUserInfo,
  parseUserData,
  incUserArtifacts,
  incUserArtifactsAndTryCount,
} = require('../functions/utils');
const { MAX_ACTIONS_COUNT } = require('../data/constants');

const User = require('../models/user');

const { INC_HELPED, INC_INTERFERE } = require('../data/constants');

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

      if (result.tryCount < MAX_ACTIONS_COUNT) {
        const { usersForAnswer } = user;
        if (usersForAnswer.length > 1) {
          const userData = await getUserInfo(usersForAnswer[1].id)
            .then(response => {
              if (response.data.response[0]) {
                return parseUserData(response.data.response[0]);
              }
              return null;
            });
          result.user = userData;
        }
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

    const { vkId, foreignId, helped } = req.body;

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
          incUserArtifacts(foreignUser.id, INC_HELPED);
          if (helped) {
            incUserArtifactsAndTryCount(vkId, INC_HELPED);
            result.artifacts += INC_HELPED;
          }
        } else if (helped) {
          incUserArtifacts(foreignUser.id, INC_INTERFERE);
          incUserArtifactsAndTryCount(vkId, -INC_HELPED);
          result.artifacts -= INC_HELPED;
        } else {
          incUserArtifacts(foreignUser.id, -INC_HELPED);
          incUserArtifactsAndTryCount(vkId, INC_INTERFERE);
          result.artifacts += INC_INTERFERE;
        }
        result.tryCount += 1;
        const newUsers = usersForAnswer.filter(el => el._id !== foreignUser._id);
        User.updateOne({ vkId }, { $set: { usersForAnswer: newUsers } }).then(() => null);
      } else result.error = true;
    } else result.error = true;

    res.json(result);
  });
};

module.exports = { getUserForAnswer, tryAnswerUser };
