import { buildAnswer } from './build-answer.js';
import { buildAssessment } from './build-assessment.js';
import { buildKnowledgeElement } from './build-knowledge-element.js';

/**
 * Fait répondre juste un utilisateur à une question.
 *
 * La valeur en pix n'est plus un paramètre : elle se lit sur l'acquis, dans le
 * référentiel que le test a décrit.
 */
const buildCorrectAnswerAndKnowledgeElement = async function ({
  userId,
  competenceId,
  challengeId,
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
    competenceId,
    answerId,
    createdAt: acquisitionDate,
    skillId,
  });
};

export { buildCorrectAnswerAndKnowledgeElement };
