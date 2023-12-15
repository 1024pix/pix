import _ from 'lodash';
import { EntityValidationError } from '../../../../shared/domain/errors.js';
import * as campaignValidator from '../../../../../lib/domain/validators/campaign-validator.js';

const updateCampaign = async function ({
  campaignId,
  name,
  title,
  customLandingPageText,
  ownerId,
  campaignAdministrationRepository,
  membershipRepository,
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

  return campaignAdministrationRepository.update(campaign);
};

export { updateCampaign };
