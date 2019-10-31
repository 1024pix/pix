const faker = require('faker');
const buildArea = require('./build-area');

module.exports = function buildUserScorecard(
  {
    id = faker.random.uuid(),
    // attributes
    name = faker.random.word(),
    description = faker.random.word(),
    index = `${faker.random.number()}.${faker.random.number()}`,
    competenceId = faker.random.uuid(),
    earnedPix = `${faker.random.number()}`,
    exactlyEarnedPix = null,
    level = `${faker.random.number()}`,
    pixScoreAheadOfNextLevel = `${faker.random.number()}`,
    status = 'STARTED',
    // relationships
    area = buildArea(),
  } = {}) {

  return {
    id,
    // attributes
    name,
    description,
    index,
    competenceId,
    earnedPix,
    exactlyEarnedPix: exactlyEarnedPix || earnedPix,
    level,
    pixScoreAheadOfNextLevel,
    status,
    // relationships
    area,
  };
};
