const Assessment = require('../models/Assessment');

const statuses = {
  NOT_STARTED: 'not_started',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  SHARED: 'shared',
};

class CampaignAssessmentParticipation {

  constructor({
    campaignParticipationId,
    userId,
    campaignId,
    assessmentId = null,
    assessmentState,
    isShared,
    isImproving = false,
  }) {
    this.campaignParticipationId = campaignParticipationId;
    this.userId = userId;
    this.campaignId = campaignId;
    this.assessmentId = assessmentId;
    this.isImproving = isImproving;

    this.status = this._getStatus(isShared, assessmentState);
  }

  _getStatus(isShared, assessmentState) {
    if (isShared) return CampaignAssessmentParticipation.statuses.SHARED;
    if (assessmentState === Assessment.states.COMPLETED) return CampaignAssessmentParticipation.statuses.COMPLETED;
    if (assessmentState === Assessment.states.STARTED) return CampaignAssessmentParticipation.statuses.ONGOING;
    return CampaignAssessmentParticipation.statuses.NOT_STARTED;
  }

  get hasStarted() {
    return this.status !== CampaignAssessmentParticipation.statuses.NOT_STARTED;
  }

  get isOngoing() {
    return this.status === CampaignAssessmentParticipation.statuses.ONGOING;
  }

  get isCompleted() {
    return this.status === CampaignAssessmentParticipation.statuses.COMPLETED;
  }

  get isShared() {
    return this.status === CampaignAssessmentParticipation.statuses.SHARED;
  }
}

CampaignAssessmentParticipation.statuses = statuses;
module.exports = CampaignAssessmentParticipation;

