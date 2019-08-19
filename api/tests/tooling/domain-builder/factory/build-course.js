const faker = require('faker');
const Course = require('../../../../lib/domain/models/Course');

module.exports = function buildCourse({
  id = faker.random.number(),

  // attributes
  description = faker.lorem.sentence(),
  imageUrl = faker.internet.url(),
  name = faker.lorem.word(),
  type = 'PLACEMENT',

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
    type,
    // relations
    assessment,
    challenges,
    competences,
    competenceSkills,
    tubes,
  });
};
