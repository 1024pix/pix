import { Feedback } from '../../../../src/evaluation/domain/models/Feedback.js';

const buildFeedback = function ({
  id = '123',
  content = `Il s'agit de la réponse que j'ai indiquée pourtant !`,
  category = `Je ne suis pas d'accord avec la réponse`,
  answer = 'Ma super réponse',
  assessmentId = '123',
  challengeId = '123',
  userAgent = 'userAgent',
  createdAt = new Date('2023-08-01T15:30:00Z'),
  updatedAt = new Date('2023-08-01T15:30:00Z'),
} = {}) {
  return new Feedback({
    id,
    content,
    category,
    answer,
    assessmentId,
    challengeId,
    userAgent,
    createdAt,
    updatedAt,
  });
};

export { buildFeedback };
