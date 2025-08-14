import _ from 'lodash';

import { EntityValidationError } from '../../../../shared/domain/errors.js';
import * as injectedMembershipRepository from '../../../../team/infrastructure/repositories/membership.repository.js';
import * as injectedCampaignAdministrationRepository from '../../infrastructure/repositories/campaign-administration-repository.js';
import * as injectedCampaignUpdateValidator from '../validators/campaign-update-validator.js';

const updateCampaign = async function ({
  campaignId,
  name,
  title,
  customLandingPageText,
  ownerId,
  campaignAdministrationRepository = injectedCampaignAdministrationRepository,
  membershipRepository = injectedMembershipRepository,
  campaignUpdateValidator = injectedCampaignUpdateValidator,
} = {}) {
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

  // TODO : should be called inside model method updateFields
  campaignUpdateValidator.validate(campaign);

  return campaignAdministrationRepository.update(campaign);
};

export { updateCampaign };
