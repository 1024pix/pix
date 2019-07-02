const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function findCampaignParticipationsRelatedToUser({ authenticatedUserId, requestedUserId, campaignParticipationRepository }) {

  if (authenticatedUserId !== requestedUserId) {
    return Promise.reject(new UserNotAuthorizedToAccessEntity());
  }

  return campaignParticipationRepository.findByUserId(requestedUserId);

};
