import Course from '../../../../lib/domain/models/Course';

export default function buildCourse({
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
}
