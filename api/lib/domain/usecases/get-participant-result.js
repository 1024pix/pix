const { UserNotAuthorizedToAccessEntityError } = require('../errors');

module.exports = async function getParticipantResult({
  userId,
  locale,
  campaignParticipationId,
  campaignParticipationRepository,
  participantResultRepository,
}) {

  await _checkCampaignParticipationIsOwnedByUser(campaignParticipationRepository, campaignParticipationId, userId);

  return participantResultRepository.getByParticipationId(campaignParticipationId, locale);
};

async function _checkCampaignParticipationIsOwnedByUser(campaignParticipationRepository, campaignParticipationId, userId) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);
  if (campaignParticipation.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntityError();
  }
}
