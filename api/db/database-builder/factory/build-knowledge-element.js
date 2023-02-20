import buildAnswer from './build-answer';
import buildAssessment from './build-assessment';
import buildUser from './build-user';
import databaseBuffer from '../database-buffer';
import KnowledgeElement from '../../../lib/domain/models/KnowledgeElement';
import _ from 'lodash';

export default function buildKnowledgeElement({
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
}
