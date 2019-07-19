const {
  ChallengeAlreadyAnsweredError,
  UserHasBeenMigratedToV2Error,
  ForbiddenAccess
} = require('../errors');
const Examiner = require('../models/Examiner');
const KnowledgeElement = require('../models/KnowledgeElement');

module.exports = async function correctAnswerThenUpdateAssessment(
  {
    answer,
    userId,
    answerRepository,
    assessmentRepository,
    challengeRepository,
    competenceEvaluationRepository,
    skillRepository,
    smartPlacementAssessmentRepository,
    knowledgeElementRepository,
    userRepository,
  } = {}) {
  const answersFind = await answerRepository.findByChallengeAndAssessment({
    assessmentId: answer.assessmentId,
    challengeId: answer.challengeId,
  });

  if (answersFind) {
    throw new ChallengeAlreadyAnsweredError();
  }

  const assessment = await assessmentRepository.get(answer.assessmentId);

  if (assessment.userId != userId) {
    throw new ForbiddenAccess('User is not allowed to access this area');
  }

  if (assessment.isPlacement()) {
    const user = await userRepository.get(assessment.userId);

    if (user.isProfileV2) {
      throw new UserHasBeenMigratedToV2Error();
    }
  }

  const challenge = await challengeRepository.get(answer.challengeId);
  const correctedAnswer = evaluateAnswer(challenge, answer);

  const answerSaved = await answerRepository.save(correctedAnswer);

  if (assessment.isCompetenceEvaluation()) {
    await saveKnowledgeElementsForCompetenceEvaluation({
      assessment,
      answer: answerSaved,
      challenge,
      competenceEvaluationRepository,
      skillRepository,
      knowledgeElementRepository
    });
  }

  if (assessment.isSmartPlacement()) {
    await saveKnowledgeElementsForSmartPlacement({
      answer: answerSaved,
      challenge,
      smartPlacementAssessmentRepository,
      knowledgeElementRepository,
    });
  }

  return answerSaved;
};

function evaluateAnswer(challenge, answer) {
  const examiner = new Examiner({ validator: challenge.validator });
  return examiner.evaluate(answer);
}

async function saveKnowledgeElementsForSmartPlacement({ answer, challenge, smartPlacementAssessmentRepository, knowledgeElementRepository }) {

  const smartPlacementAssessment = await smartPlacementAssessmentRepository.get(answer.assessmentId);

  return saveKnowledgeElements({
    userId: smartPlacementAssessment.userId,
    targetSkills: smartPlacementAssessment.targetProfile.skills,
    knowledgeElements: smartPlacementAssessment.knowledgeElements,
    answer,
    challenge,
    knowledgeElementRepository,
  });
}

async function saveKnowledgeElementsForCompetenceEvaluation({ assessment, answer, challenge, competenceEvaluationRepository, skillRepository, knowledgeElementRepository }) {

  const competenceEvaluation = await competenceEvaluationRepository.getByAssessmentId(assessment.id);
  const [targetSkills, knowledgeElements] = await Promise.all([
    skillRepository.findByCompetenceId(competenceEvaluation.competenceId),
    knowledgeElementRepository.findUniqByUserId({ userId: assessment.userId })]
  );

  return saveKnowledgeElements({
    userId: assessment.userId,
    targetSkills,
    knowledgeElements,
    answer,
    challenge,
    knowledgeElementRepository,
  });
}

function saveKnowledgeElements({ userId, targetSkills, knowledgeElements, answer, challenge, knowledgeElementRepository }) {

  const knowledgeElementsToCreate = KnowledgeElement.createKnowledgeElementsForAnswer({
    answer,
    challenge,
    previouslyFailedSkills: _getSkillsFilteredByStatus(knowledgeElements, targetSkills, KnowledgeElement.StatusType.INVALIDATED),
    previouslyValidatedSkills: _getSkillsFilteredByStatus(knowledgeElements, targetSkills, KnowledgeElement.StatusType.VALIDATED),
    targetSkills,
    userId
  });

  return knowledgeElementsToCreate.map((knowledgeElement) =>
    knowledgeElementRepository.save(knowledgeElement));
}

function _getSkillsFilteredByStatus(knowledgeElements, targetSkills, status) {
  return knowledgeElements
    .filter((knowledgeElement) => knowledgeElement.status === status)
    .map((knowledgeElement) => knowledgeElement.skillId)
    .map((skillId) => targetSkills.find((skill) => skill.id === skillId));
}
