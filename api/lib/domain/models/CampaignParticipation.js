const _ = require('lodash');

class CampaignParticipation {

  constructor({
    id,
    // attributes
    isShared,
    sharedAt,
    participantExternalId,
    // includes
    campaign,
    // references
    assessmentId,
    campaignId,
    userId,
  } = {}) {
    this.id = id;
    this.campaign = campaign;
    this.campaignId = campaignId;
    this.assessmentId = assessmentId;
    this.participantExternalId = participantExternalId;
    this.isShared = isShared;
    this.sharedAt = sharedAt;
    this.userId = userId;
  }

  isAboutCampaignCode(code) {
    return this.campaign.code === code;
  }

  getTargetProfileId() {
    return _.get(this, 'campaign.targetProfileId', null);
  }

}

module.exports = CampaignParticipation;
