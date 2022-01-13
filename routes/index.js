const checkUser = require('./checkUser');
const getStats = require('./getStats');
const { checkAudio, tryAnswerAudio } = require('./audio');
const { checkKey, tryAnswerKey } = require('./keys');

module.exports = app => {
  checkUser(app);
  getStats(app);
  checkAudio(app);
  tryAnswerAudio(app);
  checkKey(app);
  tryAnswerKey(app);
};
