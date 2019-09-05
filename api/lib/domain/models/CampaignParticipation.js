const _ = require('lodash');

class CampaignParticipation {

  constructor({
    id,
    // attributes
    createdAt,
    isShared,
    participantExternalId,
    sharedAt,
    // includes
    assessment,
    campaign,
    campaignParticipationResult,
    user,
    // references
    campaignId,
    userId,
  } = {}) {
    this.id = id;
    this.createdAt = createdAt;
    this.isShared = isShared;
    this.participantExternalId = participantExternalId;
    this.sharedAt = sharedAt;
    this.assessment = assessment;
    this.campaign = campaign;
    this.campaignParticipationResult = campaignParticipationResult;
    this.user = user;
    this.campaignId = campaignId;
    this.userId = userId;
  }

  getTargetProfileId() {
    return _.get(this, 'campaign.targetProfileId', null);
  }

}

module.exports = CampaignParticipation;
