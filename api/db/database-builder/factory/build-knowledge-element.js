import { buildAnswer } from './build-answer.js';
import { buildAssessment } from './build-assessment.js';
import { buildUser } from './build-user.js';
import { databaseBuffer } from '../database-buffer.js';
import { KnowledgeElement } from '../../../lib/domain/models/KnowledgeElement.js';
import _ from 'lodash';

const buildKnowledgeElement = function ({
  id = databaseBuffer.getNextId(),
  source = KnowledgeElement.SourceType.DIRECT,
  status = KnowledgeElement.StatusType.VALIDATED,
  createdAt = new Date('2020-01-01'),
  earnedPix = 2,
  skillId = 'recABC123',
  assessmentId,
  answerId,
  userId,
  competenceId = 'recCHA789',
} = {}) {
  userId = _.isUndefined(userId) ? buildUser().id : userId;
  assessmentId = _.isUndefined(assessmentId) ? buildAssessment({ userId }).id : assessmentId;
  answerId = _.isUndefined(answerId) ? buildAnswer({ assessmentId }).id : answerId;

  const correctEarnedPix = status === KnowledgeElement.StatusType.VALIDATED ? earnedPix : 0;
  const values = {
    id,
    source,
    status,
    createdAt,
    earnedPix: correctEarnedPix,
    skillId,
    assessmentId,
    answerId,
    userId,
    competenceId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'knowledge-elements',
    values,
  });
};

export { buildKnowledgeElement };
