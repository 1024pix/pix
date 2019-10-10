const Tube = require('../../../../lib/domain/models/Tube');
const faker = require('faker');

const buildSkillCollection = require('./build-skill-collection');

module.exports = function buildTube({
  id = faker.random.uuid(),
  name = faker.random.word(),
  title = faker.random.word(),
  description = faker.lorem.sentence(),
  practicalTitle = faker.random.word(),
  practicalDescription = faker.lorem.sentence(),
  skills = buildSkillCollection(),
} = {}) {
  return new Tube({
    id,
    name,
    title,
    description,
    practicalTitle,
    practicalDescription,
    skills
  });
};
