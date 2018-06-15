
const faker = require('faker');

const Course = require('../../lib/domain/models/Course');

module.exports = function buildCourse({
  id = `rec${faker.lorem.word()}`,
  // attributes
  description = 'some description',
  imageUrl,
  isAdaptive = true,
  name = faker.lorem.word(),
  type = 'PLACEMENT',
  // relations
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
    isAdaptive,
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
