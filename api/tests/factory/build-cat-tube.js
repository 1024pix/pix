
const faker = require('faker');

const CatSkill = require('../../lib/cat/skill');

module.exports = function BuildCatTube({
  name = faker.lorem.word(),
  min = 1,
  max = 6,
} = {}) {

  const skills = [];

  for (let i = min; i <= max; i += 1) {
    skills.push(new CatSkill(`@${name}${i}`));
  }

  return skills;
};
