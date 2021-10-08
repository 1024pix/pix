const _ = require('lodash');
const {
  ArchivedCampaignError,
  AssessmentNotCompletedError,
  AlreadySharedCampaignParticipationError,
  CantImproveCampaignParticipationError,
} = require('../errors');

const statuses = {
  STARTED: 'STARTED',
  TO_SHARE: 'TO_SHARE',
  SHARED: 'SHARED',
};

class CampaignParticipation {
  constructor({
    id,
    createdAt,
    participantExternalId,
    status,
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
    this.status = status;
    this.participantExternalId = participantExternalId;
    this.sharedAt = sharedAt;
    this.campaign = campaign;
    this.user = user;
    this.assessments = assessments;
    this.assessmentId = assessmentId;
    this.campaignId = campaignId;
    this.userId = userId;
    this.status = status;
    this.validatedSkillsCount = validatedSkillsCount;
    this.pixScore = pixScore;
  }

  static start(campaignParticipation) {
    const { isAssessment } = campaignParticipation.campaign;
    const { STARTED, TO_SHARE } = CampaignParticipation.statuses;

    const status = isAssessment ? STARTED : TO_SHARE;

    return new CampaignParticipation({ ...campaignParticipation, status });
  }

  get isShared() {
    return this.status === statuses.SHARED;
  }

  get lastAssessment() {
    return _.maxBy(this.assessments, 'createdAt');
  }

  getTargetProfileId() {
    return _.get(this, 'campaign.targetProfileId', null);
  }

  share() {
    this._canBeShared();
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
}

function lastAssessmentNotCompleted(campaignParticipation) {
  return !campaignParticipation.lastAssessment || !campaignParticipation.lastAssessment.isCompleted();
}

CampaignParticipation.statuses = statuses;

module.exports = CampaignParticipation;
