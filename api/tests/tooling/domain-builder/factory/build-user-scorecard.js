const faker = require('faker');
const buildArea = require('./build-area');

module.exports = function buildUserScorecard(
  {
    id = faker.random.uuid(),
    // attributes
    name = faker.random.word(),
    index = `${faker.random.number()}.${faker.random.number()}`,
    courseId = faker.random.uuid(),
    earnedPix = `${faker.random.number()}`,
    level = `${faker.random.number()}`,
    pixScoreAheadOfNextLevel = `${faker.random.number()}`,
    // relationships
    area = buildArea(),
  } = {}) {

  return {
    id,
    // attributes
    name,
    index,
    courseId,
    earnedPix,
    level,
    pixScoreAheadOfNextLevel,
    // relationships
    area,
  };
};
