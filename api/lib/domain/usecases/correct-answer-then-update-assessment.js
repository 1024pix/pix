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

  const answersFind = await answerRepository.findByChallengeAndAssessment({
    assessmentId: answer.assessmentId,
    challengeId: answer.challengeId,
  });
  if (answersFind) {
    throw new ChallengeAlreadyAnsweredError();
  }

  const challenge = await challengeRepository.get(answer.challengeId);
  const correctedAnswer = evaluateAnswer(challenge, answer);

  const answerSaved = await answerRepository.save(correctedAnswer);
  return smartPlacementAssessmentRepository.get(answer.assessmentId)
    .then((smartPlacementAssessment) => {
      return saveKnowledgeElements({
        assessment: smartPlacementAssessment,
        answer: answerSaved,
        challenge,
        smartPlacementKnowledgeElementRepository,
      });
    })
    .then(() => answerSaved)
    .catch((error) => {
      if(error instanceof NotFoundError) {
        return answerSaved;
      }
      throw error;
    });
};

function evaluateAnswer(challenge, answer) {
  const examiner = new Examiner({ validator: challenge.validator });
  return examiner.evaluate(answer);
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
