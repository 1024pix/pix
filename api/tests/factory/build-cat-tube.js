
const faker = require('faker');

const CatSkill = require('../../lib/cat/skill');

module.exports = function buildCatTube({
  name = faker.lorem.word(),
  minLevel = 1,
  maxLevel = 6,
} = {}) {

  const skills = [];

  for (let i = minLevel; i <= maxLevel; i += 1) {
    skills.push(new CatSkill(`@${name}${i}`));
  }

  return skills;
};
