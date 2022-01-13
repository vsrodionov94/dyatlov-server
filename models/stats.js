const mongoose = require('mongoose');

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
  repostsCount: {
    type: Number,
    index: true,
    default: 0,
  },
});

module.exports = mongoose.model('stats', statsSchema);
