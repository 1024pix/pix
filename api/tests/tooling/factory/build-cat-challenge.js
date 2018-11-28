const faker = require('faker');
const buildCatTube = require('./build-cat-tube');
const CatChallenge = require('../../../lib/cat/challenge');

module.exports = function buildCatChallenge({
  id = faker.random.uuid(),
  status = 'validé',
  timer = undefined,
  skills = buildCatTube({ minLevel: 4, maxLevel: 4 })
} = {}) {
  return new CatChallenge(id, status, skills, timer);
};
