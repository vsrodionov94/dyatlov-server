const axios = require('axios');
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

const checkRefAndUpdate = vkId => {
  const MAX_INVITE_COUNT = 3;
  const INC_ARTEFACTS = 2;
  const user = User.findOne({ vkId }).then(found => found);
  if (user) {
    const currentDay = getCurrentDay();
    if (user.lastDay < currentDay) {
      updateUserDay(vkId, currentDay);
      user.inviteCount = 0;
    }

    if (user.inviteCount < MAX_INVITE_COUNT) {
      User.updateOne(
        { vkId },
        { $inc: { inviteCount: 1, artefacts: INC_ARTEFACTS } },
      ).then(() => null);
    }
  }
};

const checkEventTime = () => {
  const currentTime = Math.round(new Date().getTime() / 1000);
  return currentTime <= process.env.END_DAY && currentTime >= process.env.START_DAY;
};

const getUserInfo = id => {
  const method = 'users.get';
  const version = '5.131';
  const fields = 'photo_200,sex,bdate';
  const userIds = id;
  const nameCase = 'Nom';
  const lang = 'ru';
  return axios.get(`https://api.vk.com/method/${method}`, {
    params: {
      v: version,
      access_token: process.env.VK_ACCESS_TOKEN,
      user_ids: userIds,
      fields: fields,
      name_case: nameCase,
      lang: lang,
    },
  });
};

const parseUserData = data => {
  const {
    id,
    first_name: firstName,
    last_name: lastName,
    sex,
    bdate,
  } = data;
  const hasAge = bdate && bdate.split('.')[2];
  const calculatedAge = hasAge ? new Date().getFullYear - Number(bdate.split('.')[2]) : '-';
  return {
    id: id,
    name: `${firstName} ${lastName}`,
    sex: sex === 1 ? 'женский' : 'мужской',
    age: String(calculatedAge),
  };
};

const incUserArtefacts = (vkId, count) => {
  User.updateOne({ vkId }, { $inc: { artifacts: count } }).then(() => null);
};

const incUserArtefactsAndTryCount = (vkId, count) => {
  User.updateOne({ vkId }, { $inc: { artifacts: count, tryUserAnswerCount: 1 } }).then(() => null);
};

module.exports = {
  randomInt,
  getCurrentDay,
  updateUserDay,
  checkRefAndUpdate,
  checkEventTime,
  getUserInfo,
  parseUserData,
  incUserArtefacts,
  incUserArtefactsAndTryCount,
};
