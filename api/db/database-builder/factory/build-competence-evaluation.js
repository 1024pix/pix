import { buildAssessment } from './build-assessment.js';
import { buildUser } from './build-user.js';
import { databaseBuffer } from '../database-buffer.js';
import { CompetenceEvaluation } from '../../../src/evaluation/domain/models/CompetenceEvaluation.js';
import _ from 'lodash';

const buildCompetenceEvaluation = function ({
  id = databaseBuffer.getNextId(),
  assessmentId,
  competenceId = 'recABC123',
  status = CompetenceEvaluation.statuses.STARTED,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
  userId,
} = {}) {
  userId = _.isUndefined(userId) ? buildUser().id : userId;
  assessmentId = _.isUndefined(assessmentId) ? buildAssessment({ userId }).id : assessmentId;

  const values = {
    id,
    assessmentId,
    competenceId,
    userId,
    createdAt,
    updatedAt,
    status,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'competence-evaluations',
    values,
  });
};

export { buildCompetenceEvaluation };
