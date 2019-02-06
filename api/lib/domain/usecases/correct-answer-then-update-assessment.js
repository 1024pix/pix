const { ChallengeAlreadyAnsweredError, NotFoundError } = require('../errors');
const Examiner = require('../models/Examiner');
const KnowledgeElement = require('../models/SmartPlacementKnowledgeElement');

module.exports = function correctAnswerThenUpdateAssessment(
  {
    answer,
    answerRepository,
    challengeRepository,
    smartPlacementAssessmentRepository,
    smartPlacementKnowledgeElementRepository,
  } = {}) {

  let associatedChallenge = null;
  let answerSaved = null;

  return answerRepository
    .hasChallengeAlreadyBeenAnswered({
      assessmentId: answer.assessmentId,
      challengeId: answer.challengeId,
    })
    .then(throwIfChallengeAlreadyAnswered)
    .then(() => {
      return challengeRepository.get(answer.challengeId);
    })
    .then((challengeFind) => {
      associatedChallenge = challengeFind;
      return evaluateAnswer(associatedChallenge, answer);
    })
    .then(answerRepository.save)
    .then((answerReturnAfterSaved) => {
      answerSaved = answerReturnAfterSaved;
      return saveKnowledgeElementsIfSmartPlacement({
        associatedChallenge,
        answerSaved,
        smartPlacementAssessmentRepository,
        smartPlacementKnowledgeElementRepository,
      });
    })
    .then(() => answerSaved);
};

function throwIfChallengeAlreadyAnswered(challengeHasBeenAnswered) {
  if (challengeHasBeenAnswered) {
    throw new ChallengeAlreadyAnsweredError();
  }
}

function evaluateAnswer(challenge, answer) {
  const examiner = new Examiner({ validator: challenge.validator });
  return examiner.evaluate(answer);
}

function saveKnowledgeElementsIfSmartPlacement(
  {
    associatedChallenge,
    answerSaved,
    smartPlacementAssessmentRepository,
    smartPlacementKnowledgeElementRepository,
  }) {
  return smartPlacementAssessmentRepository.get(answerSaved.assessmentId)
    .then((assessment) => {
      return saveKnowledgeElements({
        assessment,
        answer: answerSaved,
        associatedChallenge,
        smartPlacementKnowledgeElementRepository,
      });
    })
    .catch(absorbSmartAssessmentNotFoundError);
}

function saveKnowledgeElements({ assessment, answer, associatedChallenge, smartPlacementKnowledgeElementRepository }) {

  const knowledgeElements = KnowledgeElement.createKnowledgeElementsForAnswer({
    answer,
    associatedChallenge,
    previouslyFailedSkills: assessment.getFailedSkills(),
    previouslyValidatedSkills: assessment.getValidatedSkills(),
    targetSkills: assessment.targetProfile.skills,
  });

  const saveKnowledgeElementPromises = knowledgeElements.map((knowledgeElement) => {
    return smartPlacementKnowledgeElementRepository.save(knowledgeElement);
  });

  return Promise.all(saveKnowledgeElementPromises);

}

function absorbSmartAssessmentNotFoundError(error) {
  if (!(error instanceof NotFoundError)) {
    throw error;
  }
}
