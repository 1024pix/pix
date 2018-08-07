const _ = require('lodash');

class CampaignParticipation {

  constructor({ id, campaign, assessmentId } = {}) {
    this.id = id;
    this.campaign = campaign;
    this.assessmentId = assessmentId;
  }

  isAboutCampaignCode(code) {
    return this.campaign.code === code;
  }

  getTargetProfileId() {
    if(_.has(this, 'campaign.targetProfileId')) {
      return this.campaign.targetProfileId;
    }
    return null;
  }

  adaptModelToDb() {
    return {
      assessmentId: this.assessmentId,
      campaignId: this.campaign.id,
    };
  }

}

module.exports = CampaignParticipation;
