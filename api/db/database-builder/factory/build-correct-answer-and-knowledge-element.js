import buildAssessment from './build-assessment';
import buildAnswer from './build-answer';
import buildKnowledgeElement from './build-knowledge-element';

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

export default buildCorrectAnswerAndKnowledgeElement;
