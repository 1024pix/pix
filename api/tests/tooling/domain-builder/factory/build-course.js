const Course = require('../../../../lib/domain/models/Course');

module.exports = function buildCourse({
  id = 'recCOUR123',
  description = 'description',
  imageUrl = 'imageURL',
  name = 'name',
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
