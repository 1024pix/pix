const Competence = require('../../lib/domain/models/Competence');

module.exports = function buildCompetence({
  id = 'recsvLz0W2ShyfD63',
  name = 'Mener une recherche et une veille d’information',
  index = '1.1',
  courseId = undefined,
  skills = [],
  area = undefined,
} = {}) {

  return new Competence({
    id,
    name,
    index,
    courseId,
    skills,
    area,
  });
};
