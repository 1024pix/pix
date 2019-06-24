const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = ({ authenticatedUserId, requestedUserId, campaignParticipationRepository }) => {

  if (authenticatedUserId !== requestedUserId) {
    return Promise.reject(new UserNotAuthorizedToAccessEntity());
  }

  return campaignParticipationRepository.findByUserIdUniqByCampaignId(requestedUserId);

};
