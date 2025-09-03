import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';

class CampaignParticipantActivity {
  constructor({
    campaignParticipationId,
    userId,
    firstName,
    lastName,
    participantExternalId,
    sharedAt,
    status,
    lastCampaignParticipationId,
    participationCount,
  } = {}) {
    this.campaignParticipationId = campaignParticipationId;
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.participantExternalId = participantExternalId;
    this.sharedAt = sharedAt;
    // TODO Remove TO_SHARE status once it's no longer used
    this.status = status === CampaignParticipationStatuses.TO_SHARE ? CampaignParticipationStatuses.STARTED : status;
    this.lastCampaignParticipationId = lastCampaignParticipationId || campaignParticipationId;
    this.participationCount = participationCount || 0;
  }
}

export { CampaignParticipantActivity };
