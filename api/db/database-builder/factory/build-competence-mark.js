import buildAssessmentResult from './build-assessment-result';
import databaseBuffer from '../database-buffer';
import _ from 'lodash';

export default function buildCompetenceMark({
  id = databaseBuffer.getNextId(),
  level = 5,
  score = 42,
  area_code = '1',
  competence_code = '1.1',
  competenceId = 'recABC123',
  assessmentResultId,
  createdAt = new Date('2020-01-01'),
} = {}) {
  assessmentResultId = _.isUndefined(assessmentResultId) ? buildAssessmentResult().id : assessmentResultId;

  const values = {
    id,
    level,
    score,
    area_code,
    competence_code,
    competenceId,
    assessmentResultId,
    createdAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'competence-marks',
    values,
  });
}
