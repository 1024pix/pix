const _ = require('lodash');
const {
  ChallengeAlreadyAnsweredError,
  ForbiddenAccess
} = require('../errors');
const constants = require('../constants');

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
    targetProfileRepository,
    knowledgeElementRepository,
  } = {}) {
  const assessment = await assessmentRepository.get(answer.assessmentId);
  if (assessment.userId !== userId) {
    throw new ForbiddenAccess('User is not allowed to add an answer for this assessment.');
  }

  const challenge = await challengeRepository.get(answer.challengeId);
  const correctedAnswer = _evaluateAnswer(challenge, answer);
  let scorecardBeforeAnswer;
  if (correctedAnswer.result.isOK() && (assessment.isCompetenceEvaluation() || assessment.isSmartPlacement())) {
    scorecardBeforeAnswer = await scorecardService.computeScorecard({
      userId,
      competenceId: challenge.competenceId,
      competenceRepository,
      competenceEvaluationRepository,
      knowledgeElementRepository,
      blockReachablePixAndLevel: true,
    });
  }

  const answersFind = await answerRepository.findByChallengeAndAssessment({
    assessmentId: answer.assessmentId,
    challengeId: answer.challengeId,
  });

  if (answersFind) {
    throw new ChallengeAlreadyAnsweredError();
  }

  let knowledgeElementsFromAnswer = [];
  if (assessment.isCompetenceEvaluation() || assessment.isSmartPlacement()) {
    knowledgeElementsFromAnswer = await _getKnowledgeElements({
      assessment,
      answer: correctedAnswer,
      challenge,
      skillRepository,
      targetProfileRepository,
      knowledgeElementRepository
    });
  }

  let answerSaved = await answerRepository.save(correctedAnswer);
  knowledgeElementsFromAnswer.map((knowledgeElement) => knowledgeElement.answerId = answerSaved.id);
  const knowledgeElements = await Promise.all(knowledgeElementsFromAnswer.map((knowledgeElement) =>
    knowledgeElementRepository.save(knowledgeElement)));

  answerSaved = _addLevelUpInformation({ answerSaved, correctedAnswer, assessment, knowledgeElements, scorecardBeforeAnswer });

  return answerSaved;
};

function _evaluateAnswer(challenge, answer) {
  const examiner = new Examiner({ validator: challenge.validator });
  return examiner.evaluate(answer);
}

async function _getKnowledgeElements({ assessment, answer, challenge, skillRepository, targetProfileRepository, knowledgeElementRepository }) {
  const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId: assessment.userId });
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
    .filter((skillId) => targetSkills.find((skill) => skill.id === skillId));
}

function _addLevelUpInformation({ answerSaved, correctedAnswer, assessment, knowledgeElements, scorecardBeforeAnswer }) {
  answerSaved.levelup = {};

  if (correctedAnswer.result.isOK() && (assessment.isCompetenceEvaluation() || assessment.isSmartPlacement())) {
    const sumPixEarned = _.sumBy(knowledgeElements, 'earnedPix');
    const totalPix = scorecardBeforeAnswer.exactlyEarnedPix + sumPixEarned;
    const userLevel = Math.min(constants.MAX_REACHABLE_LEVEL, _.floor(totalPix / constants.PIX_COUNT_BY_LEVEL));

    if (scorecardBeforeAnswer.level < userLevel) {
      answerSaved.levelup = {
        id: answerSaved.id,
        competenceName: scorecardBeforeAnswer.name,
        level: userLevel,
      };
    }
  }
  return answerSaved;
}
