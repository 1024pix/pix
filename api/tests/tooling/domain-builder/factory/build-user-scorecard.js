const faker = require('faker');
const buildArea = require('./build-area');

module.exports = function buildUserScorecard(
  {
    id = faker.random.uuid(),
    // attributes
    name = faker.random.word(),
    description = faker.random.word(),
    index = `${faker.random.number()}.${faker.random.number()}`,
    earnedPix = `${faker.random.number()}`,
    level = `${faker.random.number()}`,
    remainingPixToNextLevel= `${faker.random.number()}`,
    // relationships
    area = buildArea(),
  } = {}) {

  return {
    id,
    // attributes
    name,
    description,
    index,
    earnedPix,
    level,
    remainingPixToNextLevel,
    // relationships
    area,
  };
};
