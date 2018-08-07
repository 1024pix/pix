const faker = require('faker');
const Skill = require('../../lib/domain/models/Skill');

module.exports = function buildSkill({
  id = `rec${faker.random.word()}`,
  name = `@${faker.lorem.word()}${faker.random.number(8)}`,
} = {}) {
  return new Skill({ id, name });
};
