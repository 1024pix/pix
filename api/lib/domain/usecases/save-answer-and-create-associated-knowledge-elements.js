const { ChallengeAlreadyAnsweredError, NotFoundError } = require('../errors');
const Examiner = require('../models/Examiner');
const KnowledgeElement = require('../models/SmartPlacementKnowledgeElement');

module.exports = function({
  answer,
  answerRepository,
  challengeRepository,
  smartPlacementAssessmentRepository,
  smartPlacementKnowledgeElementRepository,
} = {}) {

  const contextObject = {
    challenge: undefined,
    answer: undefined,
  };

  return answerRepository
    .hasChallengeAlreadyBeenAnswered({
      assessmentId: answer.assessmentId,
      challengeId: answer.challengeId,
    })
    .then(throwIfChallengeAlreadyAnswered)
    .then(() => challengeRepository.get(answer.challengeId))
    .then(saveChallengeToContext(contextObject))
    .then(correctAnswer({ answer }))
    .then(answerRepository.save)
    .then(saveAnswerToContext(contextObject))
    .then(saveKnowledgeElementsIfSmartPlacement({
      contextObject,
      smartPlacementAssessmentRepository,
      smartPlacementKnowledgeElementRepository,
    }))
    .then(() => contextObject.answer);
};

function throwIfChallengeAlreadyAnswered(challengeHasBeenAnswered) {
  if (challengeHasBeenAnswered) {
    throw new ChallengeAlreadyAnsweredError();
  }
}

function saveChallengeToContext(contextObject) {

  return (challenge) => {
    contextObject.challenge = challenge;
    return challenge;
  };
}

function saveAnswerToContext(contextObject) {

  return (answer) => {
    contextObject.answer = answer;
    return answer;
  };
}

function correctAnswer({ answer }) {
  return (challenge) => {
    const examiner = new Examiner({ validator: challenge.validator });
    return examiner.validate(answer);
  };
}

function saveKnowledgeElementsIfSmartPlacement({
  contextObject,
  smartPlacementAssessmentRepository,
  smartPlacementKnowledgeElementRepository,
}) {
  return (answer) => {
    return smartPlacementAssessmentRepository
      .get(answer.assessmentId)
      .then(saveKnowledgeElements({
        answer,
        challenge: contextObject.challenge,
        smartPlacementKnowledgeElementRepository,
      }))
      .catch(absorbSmartAssessmentNotFoundError);
  };
}

function saveKnowledgeElements({ answer, challenge, smartPlacementKnowledgeElementRepository }) {
  return (assessment) => {

    const knowledgeElements = KnowledgeElement.createKnowledgeElementsForAnswer({
      answer,
      associatedChallenge: challenge,
      previouslyFailedSkills: assessment.getFailedSkills(),
      previouslyValidatedSkills: assessment.getValidatedSkills(),
      targetSkills: assessment.targetProfile.skills,
    });

    const saveKnowledgeElementPromises = knowledgeElements.map((knowledgeElement) => {
      return smartPlacementKnowledgeElementRepository.save(knowledgeElement);
    });

    return Promise.all(saveKnowledgeElementPromises);
  };
}

function absorbSmartAssessmentNotFoundError(error) {
  if (error instanceof NotFoundError) {
    return;
  } else {
    throw error;
  }
}
