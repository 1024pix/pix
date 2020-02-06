const { UserNotAuthorizedToAccessEntity, AssessmentNotCompletedError, CampaignAlreadyArchivedError } = require('../errors');
const smartRandom = require('../services/smart-random/smart-random');
const dataFetcher = require('../services/smart-random/data-fetcher');

module.exports = async function shareCampaignResult({
  userId,
  campaignParticipationId,
  assessmentRepository,
  answerRepository,
  campaignParticipationRepository,
  challengeRepository,
  smartPlacementAssessmentRepository,
  knowledgeElementRepository,
  targetProfileRepository,
  improvementService,
  campaignRepository,
}) {
  const assessment = await assessmentRepository.getByCampaignParticipationId(campaignParticipationId);

  const belongsToUser = await smartPlacementAssessmentRepository.doesAssessmentBelongToUser(assessment.id, userId);
  if (!belongsToUser) {
    throw new UserNotAuthorizedToAccessEntity('User does not have an access to this campaign participation');
  }

  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

  const isCampaignArchived = await campaignRepository.checkIfCampaignIsArchived(campaignParticipation.campaignId);
  if (isCampaignArchived) {
    throw new CampaignAlreadyArchivedError();
  }

  const getNextChallengeData = await dataFetcher.fetchForCampaigns({
    assessment,
    answerRepository,
    targetProfileRepository,
    challengeRepository,
    knowledgeElementRepository,
    improvementService,
  });

  const { hasAssessmentEnded } = smartRandom.getPossibleSkillsForNextChallenge(getNextChallengeData);

  if (!hasAssessmentEnded) {
    throw new AssessmentNotCompletedError();
  }

  return campaignParticipationRepository.share(assessment.campaignParticipation);
};
