const { ChallengeAlreadyAnsweredError, NotFoundError } = require('../errors');
const Examiner = require('../models/Examiner');
const KnowledgeElement = require('../models/SmartPlacementKnowledgeElement');

module.exports = async function correctAnswerThenUpdateAssessment(
  {
    answer,
    answerRepository,
    challengeRepository,
    smartPlacementAssessmentRepository,
    smartPlacementKnowledgeElementRepository,
  } = {}) {

  const challengeHasBeenAnswered = await answerRepository.hasChallengeAlreadyBeenAnswered({
    assessmentId: answer.assessmentId,
    challengeId: answer.challengeId,
  });
  throwIfChallengeAlreadyAnswered(challengeHasBeenAnswered);

  const challenge = await challengeRepository.get(answer.challengeId);
  const answerSaved = await answerRepository.save(evaluateAnswer(challenge, answer));
  await saveKnowledgeElementsIfSmartPlacement({
    challenge,
    answerSaved,
    smartPlacementAssessmentRepository,
    smartPlacementKnowledgeElementRepository,
  });
  return answerSaved;
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
    challenge,
    answerSaved,
    smartPlacementAssessmentRepository,
    smartPlacementKnowledgeElementRepository,
  }) {
  return smartPlacementAssessmentRepository.get(answerSaved.assessmentId)
    .then((assessment) => {
      return saveKnowledgeElements({
        assessment,
        answer: answerSaved,
        challenge,
        smartPlacementKnowledgeElementRepository,
      });
    })
    .catch(absorbSmartAssessmentNotFoundError);
}

function saveKnowledgeElements({ assessment, answer, challenge, smartPlacementKnowledgeElementRepository }) {

  const knowledgeElements = KnowledgeElement.createKnowledgeElementsForAnswer({
    answer,
    challenge,
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
