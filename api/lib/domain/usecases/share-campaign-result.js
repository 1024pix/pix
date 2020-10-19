const { UserNotAuthorizedToAccessEntity, AssessmentNotCompletedError, CampaignAlreadyArchivedError } = require('../errors');
const CampaignParticipationResultsShared = require('../events/CampaignParticipationResultsShared');
const smartRandom = require('../services/smart-random/smart-random');
const dataFetcher = require('../services/smart-random/data-fetcher');

module.exports = async function shareCampaignResult({
  userId,
  campaignParticipationId,
  assessmentRepository,
  answerRepository,
  campaignParticipationRepository,
  challengeRepository,
  knowledgeElementRepository,
  targetProfileRepository,
  improvementService,
  campaignRepository,
}) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);
  const campaign = await campaignRepository.get(campaignParticipation.campaignId);

  const isCampaignArchived = Boolean(campaign.archivedAt);
  if (isCampaignArchived) {
    throw new CampaignAlreadyArchivedError();
  }

  if (campaign.isAssessment()) {
    const assessment = await assessmentRepository.getByCampaignParticipationId(campaignParticipation.id);

    if (assessment.userId !== userId) {
      throw new UserNotAuthorizedToAccessEntity('User does not have an access to this campaign participation');
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
  }

  await campaignParticipationRepository.share(campaignParticipation);

  return new CampaignParticipationResultsShared({
    campaignId: campaign.id,
    isAssessment: campaign.isAssessment(),
    campaignParticipationId: campaignParticipation.id,
    userId,
    organizationId: campaign.organizationId,
  });
};
