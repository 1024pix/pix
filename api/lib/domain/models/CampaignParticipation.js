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
    assessmentId
  } = {}) {
    this.id = id;
    this.campaign = campaign;
    this.assessmentId = assessmentId;
    this.participantExternalId = participantExternalId;
    this.isShared = isShared;
    this.sharedAt = sharedAt;
  }

  isAboutCampaignCode(code) {
    return this.campaign.code === code;
  }

  getTargetProfileId() {
    return _.get(this, 'campaign.targetProfileId', null);
  }

}

module.exports = CampaignParticipation;
