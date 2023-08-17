import _ from 'lodash';

export { pickOneRandomAmong, pickRandomAmong };

function pickRandomAmong(collection, howMuch) {
  const shuffledCollection = _.sortBy(collection, () => _.random(0, 100));
  return _.slice(shuffledCollection, 0, howMuch);
}

function pickOneRandomAmong(collection) {
  const items = pickRandomAmong(collection, 1);
  return items[0];
}
