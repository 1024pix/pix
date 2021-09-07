const _ = require('lodash');
const { ArchivedCampaignError, AssessmentNotCompletedError, AlreadySharedCampaignParticipationError, CantImproveCampaignParticipationError } = require('../errors');

const statuses = {
  STARTED: 'STARTED',
  TO_SHARE: 'TO_SHARE',
  SHARED: 'SHARED',
};

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
    pixScore,
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
    this.pixScore = pixScore;
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
    this.status = statuses.SHARED;
  }

  improve() {
    this._canBeImproved();

    this.status = statuses.STARTED;
  }

  _canBeImproved() {
    if (this.campaign.isProfilesCollection()) {
      throw new CantImproveCampaignParticipationError();
    }
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

CampaignParticipation.statuses = statuses;

module.exports = CampaignParticipation;
