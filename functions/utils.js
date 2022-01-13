const User = require('../models/user');

const randomInt = (min, max) => Math.round(Math.random() * (max - min) + min);

const getCurrentDay = () => {
  const ONE_DAY = 86400;
  const currentTime = Math.round(new Date().getTime() / 1000);
  const deltaTime = currentTime - process.env.START_DAY;
  return Math.floor(deltaTime / ONE_DAY);
};

const updateUserDay = (vkId, currentDay) => {
  User.updateOne({ vkId }, {
    $set: {
      tryKeyCount: 0,
      tryAudioCount: 0,
      tryUserAnswerCount: 0,
      tryUserSendCount: 0,
      inviteCount: 0,
      currentDay: currentDay,
    },
  }).then(() => null);
};

module.exports = { randomInt, getCurrentDay, updateUserDay };
