const faker = require('faker');
const Course = require('../../../../lib/domain/models/Course');

module.exports = function buildCourse({
  id = `rec${faker.random.uuid()}`,

  // attributes
  description = faker.lorem.sentence(),
  imageUrl = faker.internet.url(),
  name = faker.lorem.word(),

  // relationships
  assessment,
  challenges = [],
  competences = [],
  competenceSkills = [],
  tubes = [],
} = {}) {
  return new Course({
    id,
    // attributes
    description,
    imageUrl,
    name,
    // relations
    assessment,
    challenges,
    competences,
    competenceSkills,
    tubes,
  });
};
