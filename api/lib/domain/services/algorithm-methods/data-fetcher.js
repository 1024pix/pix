import _ from 'lodash';

async function fetchForCampaigns({
  assessment,
  answerRepository,
  campaignRepository,
  challengeRepository,
  knowledgeElementRepository,
  campaignParticipationRepository,
  improvementService,
}) {
  const campaignSkills = await campaignRepository.findSkillsByCampaignParticipationId({
    campaignParticipationId: assessment.campaignParticipationId,
  });
  const isRetrying = await campaignParticipationRepository.isRetrying({
    campaignParticipationId: assessment.campaignParticipationId,
  });

  const [allAnswers, knowledgeElements, [skills, challenges]] = await Promise.all([
    answerRepository.findByAssessment(assessment.id),
    _fetchKnowledgeElements({
      assessment,
      isRetrying,
      campaignParticipationRepository,
      knowledgeElementRepository,
      improvementService,
    }),
    _fetchSkillsAndChallenges({ campaignSkills, challengeRepository }),
  ]);

  return {
    allAnswers,
    lastAnswer: _.isEmpty(allAnswers) ? null : _.last(allAnswers),
    targetSkills: skills,
    challenges,
    knowledgeElements,
  };
}

async function _fetchKnowledgeElements({
  assessment,
  isRetrying = false,
  knowledgeElementRepository,
  improvementService,
}) {
  const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId: assessment.userId });
  return improvementService.filterKnowledgeElementsIfImproving({ knowledgeElements, assessment, isRetrying });
}

async function _fetchSkillsAndChallenges({ campaignSkills, challengeRepository }) {
  const challenges = await challengeRepository.findOperativeBySkills(campaignSkills);
  return [campaignSkills, challenges];
}

async function fetchForCompetenceEvaluations({
  assessment,
  answerRepository,
  challengeRepository,
  knowledgeElementRepository,
  skillRepository,
  improvementService,
}) {
  const [allAnswers, targetSkills, challenges, knowledgeElements] = await Promise.all([
    answerRepository.findByAssessment(assessment.id),
    skillRepository.findActiveByCompetenceId(assessment.competenceId),
    challengeRepository.findValidatedByCompetenceId(assessment.competenceId),
    _fetchKnowledgeElements({ assessment, knowledgeElementRepository, improvementService }),
  ]);

  return {
    allAnswers,
    lastAnswer: _.isEmpty(allAnswers) ? null : _.last(allAnswers),
    targetSkills,
    challenges,
    knowledgeElements,
  };
}

async function fetchForFlashCampaigns({
  assessmentId,
  answerRepository,
  challengeRepository,
  flashAssessmentResultRepository,
  locale,
}) {
  const [allAnswers, challenges, { estimatedLevel } = {}] = await Promise.all([
    answerRepository.findByAssessment(assessmentId),
    challengeRepository.findActiveFlashCompatible({ locale }),
    flashAssessmentResultRepository.getLatestByAssessmentId(assessmentId),
  ]);

  return {
    allAnswers,
    challenges,
    estimatedLevel,
  };
}

async function fetchForFlashLevelEstimation({ assessment, answerRepository, challengeRepository }) {
  const allAnswers = await answerRepository.findByAssessment(assessment.id);
  const challenges = await challengeRepository.getMany(allAnswers.map(({ challengeId }) => challengeId));

  return {
    allAnswers,
    challenges,
  };
}

export default {
  fetchForCampaigns,
  fetchForCompetenceEvaluations,
  fetchForFlashCampaigns,
  fetchForFlashLevelEstimation,
};
