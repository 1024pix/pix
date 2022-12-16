const CampaignForCreation = require('./CampaignForCreation');
const CampaignTypes = require('./CampaignTypes');
const { UserNotAuthorizedToCreateCampaignError } = require('../errors');

class CampaignCreator {
  constructor(availableTargetProfileIds) {
    this.availableTargetProfileIds = availableTargetProfileIds;
  }

  createCampaign(campaignAttributes) {
    const { type, targetProfileId } = campaignAttributes;

    if (type === CampaignTypes.ASSESSMENT) {
      _checkAssessmentCampaignCreationAllowed(targetProfileId, this.availableTargetProfileIds);
    }

    return new CampaignForCreation(campaignAttributes);
  }
}

function _checkAssessmentCampaignCreationAllowed(targetProfileId, availableTargetProfileIds) {
  if (targetProfileId && !availableTargetProfileIds.includes(targetProfileId)) {
    throw new UserNotAuthorizedToCreateCampaignError(
      `Organization does not have an access to the profile ${targetProfileId}`
    );
  }
}

module.exports = CampaignCreator;
