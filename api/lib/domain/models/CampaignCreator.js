const CampaignForCreation = require('./CampaignForCreation');
const Campaign = require('./Campaign');
const { UserNotAuthorizedToCreateCampaignError } = require('../errors');

class CampaignCreator {
  constructor(availableTargetProfileIds) {
    this.availableTargetProfileIds = availableTargetProfileIds;
  }

  createCampaign(campaignAttributes) {
    const { type, targetProfileId } = campaignAttributes;

    if (type === Campaign.types.ASSESSMENT) {
      _checkAssessmentCampaignCreatationAllowed(targetProfileId, this.availableTargetProfileIds);
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

module.exports = CampaignCreator;
