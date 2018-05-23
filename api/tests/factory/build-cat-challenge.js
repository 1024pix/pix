const CatChallenge = require('../../lib/cat/challenge');
const faker = require('faker');

module.exports = function({
  id = faker.random.uuid(),
  status = 'validé',
  timer = undefined,
  // a remplir
  skills
} = {}) {
  return new CatChallenge(id, status, skills, timer);
};
