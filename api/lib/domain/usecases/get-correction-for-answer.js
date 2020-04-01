const { AssessmentNotCompletedError, NotFoundError } = require('../errors');
const _ = require('lodash');

module.exports = async function getCorrectionForAnswer({
  assessmentRepository,
  answerRepository,
  correctionRepository,
  userTutorialRepository,
  answerId,
  userId,
} = {}) {
  const integerAnswerId = parseInt(answerId);
  if (!Number.isFinite(integerAnswerId)) {
    throw new NotFoundError(`Not found correction for answer of ID ${answerId}`);
  }
  const answer = await answerRepository.get(integerAnswerId);
  const assessment = await assessmentRepository.get(answer.assessmentId);

  _validateCorrectionIsAccessible(assessment, userId, integerAnswerId);

  const correction = await correctionRepository.getByChallengeId(answer.challengeId);

  return _addTutorialSaveInfoToCorrection(userTutorialRepository, correction, userId);
};

function _validateCorrectionIsAccessible(assessment, userId, answerId) {
  if (assessment.userId !== userId) {
    throw new NotFoundError(`Not found correction for answer of ID ${answerId}`);
  }
  if (!assessment.isCompleted() && !assessment.isSmartPlacement() && !assessment.isCompetenceEvaluation()) {
    throw new AssessmentNotCompletedError();
  }
}

function _addSaveInfoToTutorials(savedTutorialIds) {
  return (tutorial) => {
    tutorial.isSaved = _.includes(savedTutorialIds, tutorial.id);
    return tutorial;
  };
}

async function _addTutorialSaveInfoToCorrection(userTutorialRepository, correction, userId) {
  const savedTutorials = await userTutorialRepository.find({ userId });
  const savedTutorialIds = _.map(savedTutorials, 'tutorialId');

  correction.tutorials.forEach(_addSaveInfoToTutorials(savedTutorialIds));
  correction.learningMoreTutorials.forEach(_addSaveInfoToTutorials(savedTutorialIds));

  return correction;
}
