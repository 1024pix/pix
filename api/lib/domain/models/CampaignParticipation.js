const _ = require('lodash');
const { ArchivedCampaignError, AssessmentNotCompletedError, AlreadySharedCampaignParticipationError } = require('../errors');

class CampaignParticipation {

  constructor({
    id,
    createdAt,
    isShared,
    participantExternalId,
    sharedAt,
    assessments,
    campaign,
    user,
    assessmentId,
    campaignId,
    userId,
    validatedSkillsCount,
  } = {}) {
    this.id = id;
    this.createdAt = createdAt;
    this.isShared = isShared;
    this.participantExternalId = participantExternalId;
    this.sharedAt = sharedAt;
    this.campaign = campaign;
    this.user = user;
    this.assessments = assessments;
    this.assessmentId = assessmentId;
    this.campaignId = campaignId;
    this.userId = userId;
    this.validatedSkillsCount = validatedSkillsCount;
  }

  getTargetProfileId() {
    return _.get(this, 'campaign.targetProfileId', null);
  }

  get lastAssessment() {
    return _.maxBy(this.assessments, 'createdAt');
  }

  share() {
    this._canBeShared();

    this.isShared = true;
    this.sharedAt = new Date();
  }

  _canBeShared() {
    if (this.isShared) {
      throw new AlreadySharedCampaignParticipationError();
    }
    if (this.campaign.isArchived()) {
      throw new ArchivedCampaignError('Cannot share results on an archived campaign.');
    }
    if (this.campaign.isAssessment() && lastAssessmentNotCompleted(this)) {
      throw new AssessmentNotCompletedError();
    }
  }

  canComputeValidatedSkillsCount() {
    return this.campaign.isAssessment();
  }
}

function lastAssessmentNotCompleted(campaignParticipation) {
  return !campaignParticipation.lastAssessment || !campaignParticipation.lastAssessment.isCompleted();
}

module.exports = CampaignParticipation;
