const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = function getCampaignParticipations({
  userId,
  options,
  campaignRepository,
  campaignParticipationRepository,
}) {
  if (options.filter.campaignId) {
    return campaignRepository.checkIfUserOrganizationHasAccessToCampaign(options.filter.campaignId, userId)
      .then((access) => {
        if (access) {
          return campaignParticipationRepository.findWithUsersPaginated(options);
        }
        throw new UserNotAuthorizedToAccessEntity('User does not belong to an organization that owns the campaign');
      });
  }

};
