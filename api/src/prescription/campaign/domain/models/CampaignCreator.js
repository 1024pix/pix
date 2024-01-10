import { CampaignForCreation } from './CampaignForCreation.js';
import { CampaignTypes } from '../../../shared/domain/constants.js';

import {
  UserNotAuthorizedToCreateCampaignError,
  OrganizationNotAuthorizedMultipleSendingAssessmentToCreateCampaignError,
} from '../../../../../lib/domain/errors.js';
import * as apps from '../../../../../lib/domain/constants.js';

class CampaignCreator {
  constructor({ availableTargetProfileIds, organizationFeatures }) {
    this.availableTargetProfileIds = availableTargetProfileIds;
    this.isMultipleSendingsAssessmentEnable =
      organizationFeatures[apps.ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key];
  }

  createCampaign(campaignAttributes) {
    const { type, targetProfileId, multipleSendings, organizationId } = campaignAttributes;

    if (type === CampaignTypes.ASSESSMENT) {
      _checkAssessmentCampaignCreationAllowed(targetProfileId, this.availableTargetProfileIds);
      _checkAssessmentCampaignMultipleSendingsCreationAllowed(
        multipleSendings,
        this.isMultipleSendingsAssessmentEnable,
        organizationId,
      );
    }

    return new CampaignForCreation(campaignAttributes);
  }
}

function _checkAssessmentCampaignCreationAllowed(targetProfileId, availableTargetProfileIds) {
  if (targetProfileId && !availableTargetProfileIds.includes(targetProfileId)) {
    throw new UserNotAuthorizedToCreateCampaignError(
      `Organization does not have an access to the profile ${targetProfileId}`,
    );
  }
}

function _checkAssessmentCampaignMultipleSendingsCreationAllowed(
  multipleSendings,
  isMultipleSendingsAssessmentEnable,
  organizationId,
) {
  if (!isMultipleSendingsAssessmentEnable && multipleSendings) {
    throw new OrganizationNotAuthorizedMultipleSendingAssessmentToCreateCampaignError(organizationId);
  }
}

export { CampaignCreator };
