const faker = require('faker');
const Skill = require('../../lib/domain/models/Skill');

module.exports = function BuildSkillCollection({
  name = faker.lorem.word(),
  min = 3,
  max = 5,
} = {}) {
  const collection = [];

  for (let i = min; i <= max; i += 1) {
    collection.push(new Skill({ name }));
  }

  return collection;
};
