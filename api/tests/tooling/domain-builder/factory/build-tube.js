const Tube = require('../../../../lib/domain/models/Tube');
const faker = require('faker');

const buildSkillCollection = require('./build-skill-collection');

module.exports = function buildTube({
  id = faker.random.uuid(),
  name = '@tubeName',
  title = faker.random.word(),
  description = faker.lorem.sentence(),
  practicalTitle = faker.random.word(),
  practicalDescription = faker.lorem.sentence(),
  skills = buildSkillCollection(),
  competenceId = `rec${faker.random.uuid()}`,
} = {}) {
  return new Tube({
    id,
    name,
    title,
    description,
    practicalTitle,
    practicalDescription,
    skills,
    competenceId,
  });
};
