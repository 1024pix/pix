import {
  KnowledgeElement,
  type KnowledgeElementSource,
  type KnowledgeElementStatus,
} from '../../../src/shared/domain/models/KnowledgeElement.js';
import { databaseBuffer } from '../database-buffer.ts';
import { buildAnswer } from './build-answer.js';
import { buildAssessment } from './build-assessment.js';
import { buildUser } from './build-user.ts';

type KnowledgeElementAttributes = {
  id?: number;
  source?: KnowledgeElementSource;
  status?: KnowledgeElementStatus;
  createdAt?: Date | string;
  earnedPix?: number;
  skillId?: string;
  assessmentId?: number;
  answerId?: number;
  userId?: number;
  competenceId?: string;
};

// A missing user, assessment or answer is created on the fly, each one attached to the previous one.
const buildKnowledgeElement = ({
  id = databaseBuffer.getNextId(),
  source = KnowledgeElement.SourceType.DIRECT,
  status = KnowledgeElement.StatusType.VALIDATED,
  createdAt = new Date('2020-01-01'),
  earnedPix = 2,
  skillId = 'recABC123',
  userId = buildUser().id,
  assessmentId = buildAssessment({ userId }).id,
  answerId = buildAnswer({ assessmentId }).id,
  competenceId = 'recCHA789',
}: KnowledgeElementAttributes = {}) => {
  const values = {
    id,
    source,
    status,
    createdAt,
    earnedPix: status === KnowledgeElement.StatusType.VALIDATED ? earnedPix : 0,
    skillId,
    assessmentId,
    answerId,
    userId,
    competenceId,
  };
  return databaseBuffer.pushInsertable({ tableName: 'knowledge-elements', values });
};

export { buildKnowledgeElement, type KnowledgeElementAttributes };
