const {
  ChallengeAlreadyAnsweredError,
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
    scorecardService,
    competenceRepository,
    competenceEvaluationRepository,
    skillRepository,
    smartPlacementAssessmentRepository,
    knowledgeElementRepository,
  } = {}) {
  const answersFind = await answerRepository.findByChallengeAndAssessment({
    assessmentId: answer.assessmentId,
    challengeId: answer.challengeId,
  });

  const assessment = await assessmentRepository.get(answer.assessmentId);

  if (assessment.userId !== userId) {
    throw new ForbiddenAccess('User is not allowed to add an answer for this assessment.');
  }

  if (answersFind) {
    throw new ChallengeAlreadyAnsweredError();
  }

  const challenge = await challengeRepository.get(answer.challengeId);

  const scorecardBeforeAnswer = await scorecardService.computeScorecard({
    userId,
    competenceId: challenge.competenceId,
    competenceRepository,
    competenceEvaluationRepository,
    knowledgeElementRepository,
    blockReachablePixAndLevel: true,
  });

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

  const scorecardAfterAnswer = await scorecardService.computeScorecard({
    userId,
    competenceId: challenge.competenceId,
    competenceRepository,
    competenceEvaluationRepository,
    knowledgeElementRepository,
    blockReachablePixAndLevel: true,
  });

  if (scorecardBeforeAnswer.level < scorecardAfterAnswer.level) {
    answerSaved.levelup = {
      id: answerSaved.id,
      competenceName: scorecardAfterAnswer.name,
      level: scorecardAfterAnswer.level,
    };
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

  return Promise.all(knowledgeElementsToCreate.map((knowledgeElement) =>
    knowledgeElementRepository.save(knowledgeElement)));
}

function _getSkillsFilteredByStatus(knowledgeElements, targetSkills, status) {
  return knowledgeElements
    .filter((knowledgeElement) => knowledgeElement.status === status)
    .map((knowledgeElement) => knowledgeElement.skillId)
    .map((skillId) => targetSkills.find((skill) => skill.id === skillId));
}
