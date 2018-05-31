const faker = require('faker');
const Skill = require('../../lib/domain/models/Skill');

module.exports = function BuildSkill({
  name = `@${faker.lorem.word()}`,
} = {}) {
  return new Skill({ name });
};
