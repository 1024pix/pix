import CompetenceMark from '../../../../lib/domain/models/CompetenceMark';

export default function buildCompetenceMark({
  id,
  level = 2,
  score = 13,
  area_code = '1',
  competence_code = '1.1',
  competenceId = 'recSomeCompetence',
  assessmentResultId,
} = {}) {
  return new CompetenceMark({
    id,
    level,
    score,
    area_code,
    competence_code,
    competenceId,
    assessmentResultId,
  });
}
