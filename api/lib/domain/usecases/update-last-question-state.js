const logger = require('../../infrastructure/logger');
const Assessment = require('../models/Assessment');

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
      logger.warn('Trying to focusOut a non focused challenge', {
        challengeId,
        assessmentId,
      });

      return;
    }

    const assessment = await assessmentRepository.get(assessmentId, domainTransaction);
    if (challengeId !== assessment.lastChallengeId) {
      logger.warn('Trying to focusOut a past challenge', {
        challengeId,
        assessmentId,
      });

      return;
    }
  }

  return assessmentRepository.updateLastQuestionState({
    id: assessmentId,
    lastQuestionState,
    domainTransaction,
  });
};
