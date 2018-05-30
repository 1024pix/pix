const CompetenceMark = require('../../lib/domain/models/CompetenceMark');

module.exports = function({
  id,
  level = 2,
  score = 13,
  area_code = '1',
  competence_code = '1.1',
  assessmentResultId,
} = {}) {

  return new CompetenceMark({
    id,
    level,
    score,
    area_code,
    competence_code,
    assessmentResultId,
  });
};

