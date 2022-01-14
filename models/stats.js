const mongoose = require('mongoose');
const defaultDays = require('../data/defaultDays');

const statsSchema = new mongoose.Schema({
  usersCount: {
    type: Number,
    index: true,
    default: 0,
  },
  openedCount: {
    type: Number,
    index: true,
    default: 0,
  },
  days: {
    type: [{
      keys: Number,
      audio: Number,
    }],
    default: defaultDays,
  },
});

module.exports = mongoose.model('stats', statsSchema);
