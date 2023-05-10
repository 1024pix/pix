const _ = require('lodash');

module.exports = {
  pickRandomAmong,
};

function pickRandomAmong(collection, howMuch) {
  const shuffledCollection = _.sortBy(collection, () => _.random(0, 100));
  return _.slice(shuffledCollection, 0, howMuch);
}
