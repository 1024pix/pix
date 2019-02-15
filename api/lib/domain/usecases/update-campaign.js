const { UserNotAuthorizedToUpdateResourceError } = require('../errors');

module.exports = async function updateCampaign(
  {
    userId,
    campaignId,
    title,
    customLandingPageText,
    userRepository,
    campaignRepository,
  }) {

  const [ user, campaign ] = await Promise.all([
    userRepository.getWithMemberships(userId),
    campaignRepository.get(campaignId)
  ]);

  const organizationId = campaign.organizationId;

  if (!user.hasAccessToOrganization(organizationId)) {
    throw new UserNotAuthorizedToUpdateResourceError(`User does not have an access to the organization ${organizationId}`);
  }

  if (typeof title !== 'undefined') campaign.title = title;
  if (typeof customLandingPageText !== 'undefined') campaign.customLandingPageText = customLandingPageText;

  await campaignRepository.update(campaign);

  return campaign;
};
