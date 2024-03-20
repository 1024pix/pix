import _ from 'lodash';

import { EntityValidationError } from '../../../../shared/domain/errors.js';

const updateCampaign = async function ({
  campaignId,
  name,
  title,
  customLandingPageText,
  ownerId,
  campaignAdministrationRepository,
  membershipRepository,
  campaignUpdateValidator,
}) {
  const campaign = await campaignAdministrationRepository.get(campaignId);

  const organizationId = campaign.organizationId;

  if (ownerId) {
    const ownerMembership = await membershipRepository.findByUserIdAndOrganizationId({
      userId: ownerId,
      organizationId,
    });

    if (_.isEmpty(ownerMembership)) {
      throw new EntityValidationError({
        invalidAttributes: [{ attribute: 'ownerId', message: 'OWNER_NOT_IN_ORGANIZATION' }],
      });
    }
  }

  campaign.updateFields({
    name,
    title,
    customLandingPageText,
    ownerId,
  });

  campaignUpdateValidator.validate(campaign);

  return campaignAdministrationRepository.update(campaign);
};

export { updateCampaign };
