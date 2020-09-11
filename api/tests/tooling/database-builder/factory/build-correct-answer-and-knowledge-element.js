const buildAssessment = require('./build-assessment');
const buildAnswer = require('./build-answer');
const buildKnowledgeElement = require('./build-knowledge-element');

const buildCorrectAnswerAndKnowledgeElement = async function({
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

module.exports = buildCorrectAnswerAndKnowledgeElement;

