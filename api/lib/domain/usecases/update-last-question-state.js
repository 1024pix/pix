const logger = require('../../infrastructure/logger.js');
const Assessment = require('../models/Assessment.js');

module.exports = async function updateLastQuestionState({
  assessmentId,
  lastQuestionState,
  challengeId,
  domainTransaction,
  assessmentRepository,
  challengeRepository,
}) {
  if (lastQuestionState === Assessment.statesOfLastQuestion.FOCUSEDOUT && challengeId !== undefined) {
    const challenge = await challengeRepository.get(challengeId, domainTransaction);
    if (!challenge.focused) {
      logger.warn(
        {
          subject: 'focusOut',
          challengeId: challengeId,
          assessmentId: assessmentId,
        },
        'Trying to focusOut a non focused challenge'
      );

      return;
    }

    const assessment = await assessmentRepository.get(assessmentId, domainTransaction);
    if (challengeId !== assessment.lastChallengeId) {
      logger.warn(
        {
          subject: 'focusOut',
          challengeId: challengeId,
          assessmentId: assessmentId,
        },
        'An event has been received on a answer that has already been answered'
      );

      return;
    }
  }

  return assessmentRepository.updateLastQuestionState({
    id: assessmentId,
    lastQuestionState,
    domainTransaction,
  });
};
