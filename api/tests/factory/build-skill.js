const faker = require('faker');
const Skill = require('../../lib/domain/models/Skill');

module.exports = function buildSkill({
  name = `@${faker.lorem.word()}${faker.random.number(8)}`,
} = {}) {
  return new Skill({ name });
};
