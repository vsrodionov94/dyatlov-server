const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  vkId: {
    type: Number,
    required: true,
    index: true,
  },
  keys: {
    type: Number,
    required: true,
    default: 0,
    index: true,
  },
  artifacts: {
    type: Number,
    required: true,
    default: 0,
  },
  tryKeyCount: {
    type: Number,
    required: true,
    default: 0,
  },
  tryAudioCount: {
    type: Number,
    required: true,
    default: 0,
  },
  tryUserAnswerCount: {
    type: Number,
    required: true,
    default: 0,
  },
  tryUserSendCount: {
    type: Number,
    required: true,
    default: 0,
  },
  inviteCount: {
    type: Number,
    required: true,
    default: 0,
  },
  tutorial: {
    type: Boolean,
    default: false,
    required: true,
  },
  lastDay: {
    type: Number,
    required: true,
    default: 1,
  },
  usersForAnswer: {
    type: [{
      id: Number,
      helped: Boolean,
    }],
    default: 0,
    require: true,
  },
});

module.exports = mongoose.model('user', userSchema);
