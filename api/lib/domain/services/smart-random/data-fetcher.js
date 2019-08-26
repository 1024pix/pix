const constants = require('../../constants');
const _ = require('lodash');
const moment = require('moment');

async function fetchForCampaigns({
  assessment,
  answerRepository,
  targetProfileRepository,
  challengeRepository,
  knowledgeElementRepository,
}) {
  const targetProfileId = assessment.campaignParticipation.getTargetProfileId();

  const [
    answers,
    knowledgeElements,
    [
      targetSkills,
      challenges,
    ],
  ] = await Promise.all([
    answerRepository.findByAssessment(assessment.id),
    _fetchKnowledgeElementsForCampaign({ assessment, knowledgeElementRepository }),
    _fetchSkillsAndChallenges({ targetProfileId, targetProfileRepository, challengeRepository })
  ]);

  return {
    answers,
    targetSkills,
    challenges,
    knowledgeElements,
  };
}

async function _fetchKnowledgeElementsForCampaign({
  assessment,
  knowledgeElementRepository,
}) {
  let knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId: assessment.userId });
  if (assessment.isImproving) {
    const startedDateOfAssessment = assessment.createdAt;
    knowledgeElements = _.filter(knowledgeElements, (knowledgeElement) => {
      const isNotOldEnoughToBeRetry = moment(startedDateOfAssessment).diff(knowledgeElement.createdAt, 'days') < parseInt(constants.DAYS_BEFORE_IMPROVING);
      const isFromThisAssessment = knowledgeElement.assessmentId === assessment.id;
      return knowledgeElement.isValidated || isNotOldEnoughToBeRetry || isFromThisAssessment;
    });
  }
  return knowledgeElements;
}

async function _fetchSkillsAndChallenges({
  targetProfileId,
  targetProfileRepository,
  challengeRepository,
}) {
  const targetProfile = await targetProfileRepository.get(targetProfileId);
  const challenges = await challengeRepository.findBySkills(targetProfile.skills);
  return [ targetProfile.skills, challenges ];
}

async function fetchForCompetenceEvaluations({
  assessment,
  answerRepository,
  challengeRepository,
  knowledgeElementRepository,
  skillRepository,
}) {

  const [
    answers,
    targetSkills,
    challenges,
    knowledgeElements

  ] = await Promise.all([
    answerRepository.findByAssessment(assessment.id),
    skillRepository.findByCompetenceId(assessment.competenceId),
    challengeRepository.findByCompetenceId(assessment.competenceId),
    knowledgeElementRepository.findUniqByUserId({ userId: assessment.userId })]
  );

  return {
    answers,
    targetSkills,
    challenges,
    knowledgeElements,
  };
}

module.exports = {
  fetchForCampaigns,
  fetchForCompetenceEvaluations,
};
