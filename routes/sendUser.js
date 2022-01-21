const { MAX_ACTIONS_COUNT, INC_HELPED } = require('../data/constants');
const {
  getCurrentDay,
  updateUserDay,
  getUserInfo,
  parseUserData,
} = require('../functions/utils');

const User = require('../models/user');

const getForeignUser = async vkId => {
  const users = await User.aggregate().sample(1);
  if (users[0].vkId !== vkId) return users[0];
  return getForeignUser(vkId);
};

const getRandomUser = app => {
  app.post('/getRandomUser', async (req, res) => {
    const { vkId } = req.body;
    const result = {
      error: false,
      user: null,
      tryCount: 0,
    };
    const user = await User.findOne({ vkId }).then(found => found);
    if (user) {
      const currentDay = getCurrentDay();

      if (currentDay !== user.lastDay) updateUserDay(vkId, currentDay);
      else result.tryCount = user.tryUserSendCount;

      if (result.tryCount < MAX_ACTIONS_COUNT) {
        const foreignUser = await getForeignUser(vkId);
        if (foreignUser) {
          const userData = await getUserInfo(foreignUser.vkId)
            .then(response => {
              if (response.data.response) {
                return parseUserData(response.data.response[0]);
              }
              return null;
            });
          result.user = userData;
        } else result.error = true;
      } else result.user = null;
    } else result.error = true;

    res.json(result);
  });
};

const trySendUser = app => {
  app.post('/trySendUser', async (req, res) => {
    const { vkId, foreignId, helped } = req.body;
    const result = {
      error: false,
      tryCount: 0,
    };

    const user = await User.findOne({ vkId }).then(found => found);
    if (user) {
      const currentDay = getCurrentDay();
      if (currentDay !== user.lastDay) updateUserDay(vkId, currentDay);
      else result.tryCount = user.tryUserSendCount;
      const foreignUser = await User.findOne({ vkId: foreignId }).then(found => found);
      if (foreignUser) {
        const newUsers = foreignUser.usersForAnswer.concat({ id: vkId, helped: helped });
        User.updateOne({ vkId: foreignId }, { $set: { usersForAnswer: newUsers } })
          .then(() => null);
        if (helped) {
          User.updateOne({ vkId }, { $inc: { tryUserSendCount: 1, artifacts: INC_HELPED } })
            .then(() => null);
        } else {
          User.updateOne({ vkId }, { $inc: { tryUserSendCount: 1 } }).then(() => null);
        }
        result.tryCount += 1;
      } else result.error = true;
    } else result.error = true;

    res.json(result);
  });
};

module.exports = { getRandomUser, trySendUser };
