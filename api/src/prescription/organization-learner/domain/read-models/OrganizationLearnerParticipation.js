import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';

class OrganizationLearnerParticipation {
  constructor({
    id,
    campaignType,
    campaignName,
    createdAt,
    sharedAt,
    status,
    campaignId,
    participationCount,
    lastCampaignParticipationId,
  }) {
    this.id = id;
    this.campaignType = campaignType;
    this.campaignName = campaignName;
    this.createdAt = createdAt;
    this.sharedAt = sharedAt;
    // TODO Remove TO_SHARE status once not used anymore
    this.status = status === CampaignParticipationStatuses.TO_SHARE ? CampaignParticipationStatuses.STARTED : status;
    this.campaignId = campaignId;
    this.participationCount = participationCount;
    this.lastCampaignParticipationId = lastCampaignParticipationId || id;
  }
}

export { OrganizationLearnerParticipation };
