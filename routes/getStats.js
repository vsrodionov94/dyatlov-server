const Stats = require('../models/stats');
const Users = require('../models/user');

module.exports = app => {
  app.get('/getStats', async (req, res) => {
    const statsData = await Stats.findOne({}, { _id: 0, __v: 0 }).then(data => data);
    const usersData = await Users.find({}, {
      _id: 0,
      __v: 0,
      lastDay: 0,
      usersForAnswer: 0,
      tutorial: 0,
      tryKeyCount: 0,
      tryAudioCount: 0,
      tryUserAnswerCount: 0,
      tryUserSendCount: 0,
      inviteCount: 0,
    }).then(data => data);
    usersData.sort((b, a) => {
      if (a.keys < b.keys) return -1;
      if (a.keys > b.keys) return 1;
      if (a.artifacts < b.artifacts) return -1;
      if (a.artifacts > b.artifacts) return 1;
      return 0;
    });

    res.json({ stats: statsData, users: usersData });
  });
};
