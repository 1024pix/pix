const _ = require('lodash');

class CampaignParticipation {

  constructor({
    id,
    // attributes
    isShared,
    sharedAt,
    createdAt,
    participantExternalId,
    // includes
    assessment,
    campaign,
    user,
    campaignParticipationResult,
    // references
    assessmentId,
    campaignId,
    userId,
  } = {}) {
    this.id = id;
    this.campaign = campaign || { id: campaignId };
    this.campaignId = campaignId;
    this.campaignParticipationResult = campaignParticipationResult;
    this.assessmentId = assessmentId;
    this.assessment = assessment;
    this.participantExternalId = participantExternalId;
    this.isShared = isShared;
    this.sharedAt = sharedAt;
    this.createdAt = createdAt;
    this.user = user || { id: userId };
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
