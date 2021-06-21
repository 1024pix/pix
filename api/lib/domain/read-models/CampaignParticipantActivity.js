const Assessment = require('../models/Assessment');

const statuses = {
  SHARED: 'shared',
  STARTED: 'started',
  COMPLETED: 'completed',
};

class CampaignParticipantActivity {
  constructor({
    campaignParticipationId,
    userId,
    firstName,
    lastName,
    participantExternalId,
    sharedAt,
    assessmentState,
    isShared,
    progression,
  } = {}) {
    this.campaignParticipationId = campaignParticipationId;
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.participantExternalId = participantExternalId;
    this.sharedAt = sharedAt;
    this.status = this._getStatus(isShared, assessmentState);
    this.progression = progression;
  }

  _getStatus(isShared, assessmentState) {
    if (isShared) return statuses.SHARED;
    if (assessmentState === Assessment.states.STARTED) return statuses.STARTED;
    return statuses.COMPLETED;
  }

}

CampaignParticipantActivity.statuses = statuses;

module.exports = CampaignParticipantActivity;
