const { ChallengeAlreadyAnsweredError, NotFoundError } = require('../errors');
const Answer = require('../models/Answer');
const KnowledgeElement = require('../models/SmartPlacementKnowledgeElement');

module.exports = function({
  answer,
  answerRepository,
  challengeRepository,
  smartPlacementAssessmentRepository,
  smartPlacementKnowledgeElementRepository,
  solutionRepository,
  solutionService,
} = {}) {

  return answerRepository
    .hasChallengeAlreadyBeenAnswered({
      assessmentId: answer.assessmentId,
      challengeId: answer.challengeId,
    })
    .then((challengeHasBeenAnswered) => {
      if (challengeHasBeenAnswered) {
        throw new ChallengeAlreadyAnsweredError();
      }
    })
    .then(() => solutionRepository.getByChallengeId(answer.challengeId))
    .then((solution) => solutionService.validate(answer, solution))
    .then((solutionValidation) => {

      const completedAnswer = new Answer({
        elapsedTime: answer.elapsedTime,
        result: solutionValidation.result,
        resultDetails: solutionValidation.resultDetails,
        timeout: answer.timeout,
        value: answer.value,
        assessmentId: answer.assessmentId,
        challengeId: answer.challengeId,
      });

      return answerRepository.save(completedAnswer);
    })
    .then((answer) => {
      return smartPlacementAssessmentRepository
        .get(answer.assessmentId)
        .then(saveKnowledgeElements({ answer, challengeRepository, smartPlacementKnowledgeElementRepository }))
        .catch(absorbeSmartAssessmentNotFoundError)
        .then(() => answer);
    });
};

function saveKnowledgeElements({ answer, challengeRepository, smartPlacementKnowledgeElementRepository }) {
  return (assessment) => {
    return Promise.all([
      assessment,
      challengeRepository.get(answer.challengeId),
    ])
      .then(([assessment, challenge]) => {
        return KnowledgeElement.createKnowledgeElementsForAnswer({
          answer,
          associatedChallenge: challenge,
          previouslyFailedSkills: assessment.failedSkills,
          previouslyValidatedSkills: assessment.validatedSkills,
          targetSkills: assessment.targetProfile.skills,
        });
      })
      .then((knowledgeElements) => {
        const saveknowledgeElementPromises = knowledgeElements.map((knowledgeElement) => {
          return smartPlacementKnowledgeElementRepository.save(knowledgeElement);
        });
        return Promise.all(saveknowledgeElementPromises);
      });
  };
}

function absorbeSmartAssessmentNotFoundError(error) {
  if (error instanceof NotFoundError) {
    return;
  } else {
    throw error;
  }
}
