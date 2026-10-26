import { buildAnswer } from './build-answer.js';
import { buildAssessment } from './build-assessment.js';
import { buildKnowledgeElement } from './build-knowledge-element.ts';

type CorrectAnswerAndKnowledgeElementAttributes = {
  userId: number;
  competenceId: string;
  challengeId: string;
  pixValue: number;
  acquisitionDate: Date | string;
  skillId: string;
};

// A validated knowledge element, with the assessment and the correct answer it comes from.
const buildCorrectAnswerAndKnowledgeElement = ({
  userId,
  competenceId,
  challengeId,
  pixValue,
  acquisitionDate,
  skillId,
}: CorrectAnswerAndKnowledgeElementAttributes) => {
  const assessmentId = buildAssessment({ userId }).id;
  const answerId = buildAnswer({ assessmentId, challengeId }).id;
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
