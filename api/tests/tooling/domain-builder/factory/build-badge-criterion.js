const BadgeCriterion = require('../../../../lib/domain/models/BadgeCriterion');
const faker = require('faker');

module.exports = function buildBadgeCriterion(
  {
    id = 1,
    scope = faker.lorem.words(),
    threshold = faker.random.number(),
  } = {}) {
  return new BadgeCriterion({
    id,
    scope,
    threshold,
  });
};
