import { Course } from '../../../../lib/domain/models/Course.js';

const buildCourse = function ({
  id = 'recCOUR123',
  description = 'description',
  isActive = true,
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
    isActive,
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
