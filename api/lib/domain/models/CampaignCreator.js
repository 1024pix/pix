const CampaignForCreation = require('./CampaignForCreation');
const Campaign = require('./Campaign');
const { UserNotAuthorizedToCreateCampaignError } = require('../errors');

class CampaignCreator {
  constructor(availableTargetProfileIds, organizationCanCollectProfile) {
    this.availableTargetProfileIds = availableTargetProfileIds;
    this.notAllowedToCreateProfileCollectionCampaign = !organizationCanCollectProfile;
  }

  createCampaign(campaignAttributes) {
    const { type, targetProfileId } = campaignAttributes;

    if (type === Campaign.types.ASSESSMENT) {
      _checkAssessmentCampaignCreatationAllowed(targetProfileId, this.availableTargetProfileIds);
    } else {
      _checkProfileCollectionCampaignCreationAllowed(this.notAllowedToCreateProfileCollectionCampaign);
    }

    return new CampaignForCreation(campaignAttributes);
  }
}

function _checkAssessmentCampaignCreatationAllowed(targetProfileId, availableTargetProfileIds) {
  if (targetProfileId && !availableTargetProfileIds.includes(targetProfileId)) {
    throw new UserNotAuthorizedToCreateCampaignError(
      `Organization does not have an access to the profile ${targetProfileId}`
    );
  }
}

function _checkProfileCollectionCampaignCreationAllowed(notAllowedToCreateProfileCollectionCampaign) {
  if (notAllowedToCreateProfileCollectionCampaign) {
    throw new UserNotAuthorizedToCreateCampaignError(
      'Organization can not create campaign with type PROFILES_COLLECTION'
    );
  }
}

module.exports = CampaignCreator;
