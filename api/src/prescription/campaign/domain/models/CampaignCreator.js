import { ORGANIZATION_FEATURE } from '../../../../../src/shared/constants.js';
import { CampaignTypes } from '../../../shared/domain/constants.js';
import {
  CampaignTypeError,
  OrganizationNotAuthorizedMultipleSendingAssessmentToCreateCampaignError,
  OrganizationNotAuthorizedToCreateCampaignError,
  UserNotAuthorizedToCreateCampaignError,
} from '../errors.js';
import { CampaignForCreation } from './CampaignForCreation.js';

class CampaignCreator {
  constructor({ availableTargetProfileIds, organizationFeatures }) {
    this.availableTargetProfileIds = availableTargetProfileIds;
    this.isMultipleSendingsAssessmentEnable =
      organizationFeatures[ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key];
    this.isCampaignWithoutUserProfileEnable =
      organizationFeatures[ORGANIZATION_FEATURE.CAMPAIGN_WITHOUT_USER_PROFILE.key];
  }

  createCampaign(campaignAttributes, options) {
    const { type, targetProfileId, multipleSendings, organizationId } = campaignAttributes;

    if (!Object.values(CampaignTypes).includes(type)) {
      throw new CampaignTypeError(type);
    }

    if (
      (type === CampaignTypes.ASSESSMENT || type === CampaignTypes.EXAM) &&
      !options?.allowCreationWithoutTargetProfileShare
    ) {
      this.#checkOrganizationHasAccessToTargetProfile(targetProfileId);
    }

    if (type === CampaignTypes.ASSESSMENT) {
      this.#checkOrganizationCanCreateAssessmentCampaignWithMultipleSendings(multipleSendings, organizationId);
    }

    if (type === CampaignTypes.EXAM) {
      this.#checkOrganizationCanCreateCampaignOfTypeExam(organizationId);
    }

    return new CampaignForCreation(campaignAttributes);
  }

  #checkOrganizationHasAccessToTargetProfile(targetProfileId) {
    if (targetProfileId && !this.availableTargetProfileIds.includes(targetProfileId)) {
      throw new UserNotAuthorizedToCreateCampaignError(
        `Organization does not have an access to the profile ${targetProfileId}`,
      );
    }
  }

  #checkOrganizationCanCreateAssessmentCampaignWithMultipleSendings(multipleSendings, organizationId) {
    if (!this.isMultipleSendingsAssessmentEnable && multipleSendings) {
      throw new OrganizationNotAuthorizedMultipleSendingAssessmentToCreateCampaignError(organizationId);
    }
  }

  #checkOrganizationCanCreateCampaignOfTypeExam(organizationId) {
    if (!this.isCampaignWithoutUserProfileEnable) {
      throw new OrganizationNotAuthorizedToCreateCampaignError(organizationId, CampaignTypes.EXAM);
    }
  }
}

export { CampaignCreator };
