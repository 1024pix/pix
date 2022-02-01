const _ = require('lodash');
const { UserNotAuthorizedToUpdateResourceError, UserNotMemberOfOrganizationError } = require('../errors');
const campaignValidator = require('../validators/campaign-validator');

module.exports = async function updateCampaign({
  userId,
  campaignId,
  name,
  title,
  customLandingPageText,
  ownerId,
  userRepository,
  campaignRepository,
  membershipRepository,
}) {
  const [user, campaign] = await Promise.all([
    userRepository.getWithMemberships(userId),
    campaignRepository.get(campaignId),
  ]);

  const organizationId = campaign.organizationId;
  if (!user.hasAccessToOrganization(organizationId)) {
    throw new UserNotAuthorizedToUpdateResourceError(
      `User does not have an access to the organization ${organizationId}`
    );
  }

  const ownerMembership = await membershipRepository.findByUserIdAndOrganizationId({
    userId: ownerId,
    organizationId,
  });

  if (_.isEmpty(ownerMembership)) {
    throw new UserNotMemberOfOrganizationError(
      `L'utilisateur ${ownerId} n'est pas membre de l'organisation ${organizationId}`
    );
  }

  if (name !== undefined) campaign.name = name;
  if (title !== undefined) campaign.title = title;
  if (customLandingPageText !== undefined) campaign.customLandingPageText = customLandingPageText;
  if (ownerId !== undefined) campaign.ownerId = ownerId;

  const rawCampaign = {
    ...campaign,
    creatorId: campaign.creator.id,
    organizationId,
    targetProfileId: _.get(campaign, 'targetProfile.id'),
  };
  campaignValidator.validate(rawCampaign);
  await campaignRepository.update(campaign);

  return campaign;
};
