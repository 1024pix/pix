import { buildAssessment } from './build-assessment.js';
import { buildAnswer } from './build-answer.js';
import { buildKnowledgeElement } from './build-knowledge-element.js';

const buildCorrectAnswerAndKnowledgeElement = async function ({
  userId,
  competenceId,
  challengeId,
  pixValue,
  acquisitionDate,
  skillId,
}) {
  const assessmentId = buildAssessment({ userId }).id;
  const answerId = buildAnswer({
    assessmentId,
    challengeId,
  }).id;
  buildKnowledgeElement({
    userId,
    assessmentId,
    earnedPix: pixValue,
    competenceId,
    answerId,
    createdAt: acquisitionDate,
    skillId,
  });
};

export { buildCorrectAnswerAndKnowledgeElement };
