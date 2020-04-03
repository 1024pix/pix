const {
  ChallengeAlreadyAnsweredError,
  ForbiddenAccess
} = require('../errors');
const Examiner = require('../models/Examiner');
const KnowledgeElement = require('../models/KnowledgeElement');
const logger = require('../../infrastructure/logger');

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
    targetProfileRepository,
    knowledgeElementRepository,
  } = {}) {
  const assessment = await assessmentRepository.get(answer.assessmentId);
  if (assessment.userId !== userId) {
    throw new ForbiddenAccess('User is not allowed to add an answer for this assessment.');
  }

  const answersFind = await answerRepository.findByChallengeAndAssessment({
    assessmentId: answer.assessmentId,
    challengeId: answer.challengeId,
  });

  if (answersFind) {
    throw new ChallengeAlreadyAnsweredError();
  }

  const challenge = await challengeRepository.get(answer.challengeId);
  const correctedAnswer = _evaluateAnswer(challenge, answer);

  let scorecardBeforeAnswer = null;
  if (correctedAnswer.result.isOK() && assessment.hasKnowledgeElements()) {
    scorecardBeforeAnswer = await scorecardService.computeScorecard({
      userId,
      competenceId: challenge.competenceId,
      competenceRepository,
      competenceEvaluationRepository,
      knowledgeElementRepository,
    });
  }

  const knowledgeElementsFromAnswer = await _getKnowledgeElements({
    assessment,
    answer: correctedAnswer,
    challenge,
    skillRepository,
    targetProfileRepository,
    knowledgeElementRepository
  });

  let answerSaved = await answerRepository.saveWithKnowledgeElements(correctedAnswer, knowledgeElementsFromAnswer);

  if (assessment.hasKnowledgeElements() && knowledgeElementsFromAnswer.length === 0) {
    const context = {
      assessmentId: assessment.id,
      assessmentType: assessment.type,
      answerId: answerSaved.id,
      assessmentImproving: assessment.isImproving,
      challengeId: challenge.id,
      userId
    };
    logger.warn(context, 'Answer saved without knowledge element');
  }

  answerSaved = await _addLevelUpInformation({
    answerSaved,
    scorecardService,
    userId,
    competenceId: challenge.competenceId,
    competenceRepository,
    competenceEvaluationRepository,
    knowledgeElementRepository,
    scorecardBeforeAnswer
  });

  return answerSaved;
};

function _evaluateAnswer(challenge, answer) {
  const examiner = new Examiner({ validator: challenge.validator });
  return examiner.evaluate(answer);
}

async function _getKnowledgeElements({ assessment, answer, challenge, skillRepository, targetProfileRepository, knowledgeElementRepository }) {
  if (!assessment.hasKnowledgeElements()) {
    return [];
  }

  const knowledgeElements = await knowledgeElementRepository.findUniqByUserIdAndAssessmentId({ userId: assessment.userId, assessmentId: assessment.id });
  let targetSkills;
  if (assessment.isCompetenceEvaluation()) {
    targetSkills = await skillRepository.findByCompetenceId(assessment.competenceId);
  }
  if (assessment.isSmartPlacement()) {
    const targetProfile = await targetProfileRepository.getByCampaignId(assessment.campaignParticipation.campaignId);
    targetSkills = targetProfile.skills;
  }
  return KnowledgeElement.createKnowledgeElementsForAnswer({
    answer,
    challenge,
    previouslyFailedSkills: _getSkillsFilteredByStatus(knowledgeElements, targetSkills, KnowledgeElement.StatusType.INVALIDATED),
    previouslyValidatedSkills: _getSkillsFilteredByStatus(knowledgeElements, targetSkills, KnowledgeElement.StatusType.VALIDATED),
    targetSkills,
    userId: assessment.userId,
  });
}

function _getSkillsFilteredByStatus(knowledgeElements, targetSkills, status) {
  return knowledgeElements
    .filter((knowledgeElement) => knowledgeElement.status === status)
    .map((knowledgeElement) => knowledgeElement.skillId)
    .map((skillId) => targetSkills.find((skill) => skill.id === skillId));
}

async function _addLevelUpInformation(
  {
    answerSaved,
    scorecardService,
    userId,
    competenceId,
    competenceRepository,
    competenceEvaluationRepository,
    knowledgeElementRepository,
    scorecardBeforeAnswer
  }) {
  answerSaved.levelup = {};

  if (!scorecardBeforeAnswer) {
    return answerSaved;
  }

  const scorecardAfterAnswer = await scorecardService.computeScorecard({
    userId,
    competenceId,
    competenceRepository,
    competenceEvaluationRepository,
    knowledgeElementRepository,
  });

  if (scorecardBeforeAnswer.level < scorecardAfterAnswer.level) {
    answerSaved.levelup = {
      id: answerSaved.id,
      competenceName: scorecardAfterAnswer.name,
      level: scorecardAfterAnswer.level,
    };
  }
  return answerSaved;
}
