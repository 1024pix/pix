import { Course } from '../../../../lib/domain/models/Course.js';

const buildCourse = function ({
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

export { buildCourse };
