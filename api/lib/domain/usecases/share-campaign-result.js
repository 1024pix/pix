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
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);
  const campaign = await campaignRepository.get(campaignParticipation.campaignId);

  const isCampaignArchived = Boolean(campaign.archivedAt);
  if (isCampaignArchived) {
    throw new CampaignAlreadyArchivedError();
  }

  if (campaign.isAssessment()) {
    const assessment = await assessmentRepository.getByCampaignParticipationId(campaignParticipation.id);

    const belongsToUser = await smartPlacementAssessmentRepository.doesAssessmentBelongToUser(assessment.id, userId);
    if (!belongsToUser) {
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

  return campaignParticipationRepository.share(campaignParticipation);
};
