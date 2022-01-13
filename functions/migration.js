const Stats = require('../models/stats');

module.exports = async () => {
  const stats = await Stats.findOne({}).then(data => data);
  if (!stats) Stats.create({}).then(data => data);
};
