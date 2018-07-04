const { ChallengeAlreadyAnsweredError } = require('../errors');
const Answer = require('../models/Answer');
// const KnowledgeElement = require('../models/SmartPlacementKnowledgeElement');

module.exports = function({
  answer,
  answerRepository,
  smartPlacementAssessmentRepository,
  // smartPlacementKnowledgeElementRepository,
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
        .catch(() => {
          return answer;
        });
    });
};
