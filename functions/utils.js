const axios = require('axios');
const { MAX_ACTIONS_COUNT, INC_INVITE } = require('../data/constants');
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
      tvKeyAnswered: false,
      lastDay: currentDay,
    },
  }).then(() => null);
};

const checkRefAndUpdate = async vkId => {
  const user = await User.findOne({ vkId }).then(found => found);
  console.log(user.vkId, 'uservkid');
  if (user) {
    const currentDay = getCurrentDay();
    if (user.lastDay < currentDay) {
      updateUserDay(vkId, currentDay);
      user.inviteCount = 0;
    }

    if (user.inviteCount < MAX_ACTIONS_COUNT) {
      User.updateOne(
        { vkId },
        { $inc: { inviteCount: 1, artefacts: INC_INVITE } },
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
      access_token: process.env.VK_GROUP_KEY,
      user_ids: userIds,
      fields: fields,
      name_case: nameCase,
      lang: lang,
    },
  });
};

const parseUserData = data => {
  if (!data) return null;
  const {
    id,
    first_name: firstName,
    last_name: lastName,
    sex,
    bdate,
    photo_200: photo,
  } = data;
  const hasAge = bdate && bdate.split('.')[2];
  const calculatedAge = hasAge ? new Date().getFullYear() - Number(bdate.split('.')[2]) : '-';
  return {
    id: id,
    photo: photo,
    name: `${firstName}\n${lastName}`,
    sex: `пол: ${sex === 1 ? 'женский' : 'мужской'}`,
    age: `возраст: ${calculatedAge}`,
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
