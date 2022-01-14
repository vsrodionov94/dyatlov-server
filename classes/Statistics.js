const Stats = require('../models/stats');
const { getCurrentDay } = require('../functions/utils');

module.exports = class Statistics {
  static incOpenedCount() {
    Stats.updateOne({}, { $inc: { openedCount: 1 } }).then(() => null);
  }

  static incUsersCount() {
    Stats.updateOne({}, { $inc: { usersCount: 1 } }).then(() => null);
  }

  static async incKeysCount() {
    const day = getCurrentDay();
    const stats = await Stats.findOne({}).then(found => found);
    const newDays = stats.days.map((el, index) => {
      if (index === day) el.keys += 1;
      return el;
    });
    Stats.updateOne({}, { $set: { days: newDays } }).then(() => null);
  }

  static async incAudioCount() {
    const day = getCurrentDay();
    const stats = await Stats.findOne({}).then(found => found);
    const newDays = stats.days.map((el, index) => {
      if (index === day) el.audio += 1;
      return el;
    });
    Stats.updateOne({}, { $set: { days: newDays } }).then(() => null);
  }
};
