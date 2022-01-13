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

      const foreignUser = await getForeignUser();
      if (foreignUser) {
        const userData = await getUserInfo(foreignUser.vkId)
          .then(response => {
            if (response.data) {
              return parseUserData(response.data.response[0]);
            }
            return null;
          });
        result.user = userData;
      } else result.error = true;
    } else result.error = true;

    res.json(result);
  });
};

module.exports = { getRandomUser };
