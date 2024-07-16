import { Course } from '../../../../src/shared/domain/models/Course.js';

const buildCourse = function ({
  id = 'recCOUR123',
  description = 'description',
  isActive = true,
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
