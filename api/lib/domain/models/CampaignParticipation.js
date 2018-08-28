const _ = require('lodash');

class CampaignParticipation {

  constructor({ id, campaign, assessmentId, isShared } = {}) {
    this.id = id;
    this.campaign = campaign;
    this.assessmentId = assessmentId;
    this.isShared = isShared;
  }

  isAboutCampaignCode(code) {
    return this.campaign.code === code;
  }

  getTargetProfileId() {
    return _.get(this, 'campaign.targetProfileId', null);
  }

  adaptModelToDb() {
    return {
      assessmentId: this.assessmentId,
      campaignId: this.campaign.id,
    };
  }

}

module.exports = CampaignParticipation;
