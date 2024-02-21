import _ from 'lodash';
import { CampaignParticipationStatuses } from '../../../src/prescription/shared/domain/constants.js';

const { SHARED } = CampaignParticipationStatuses;

class CampaignParticipationOverview {
  constructor({
    id,
    createdAt,
    sharedAt,
    organizationName,
    status,
    campaignId,
    targetProfileId,
    campaignCode,
    campaignTitle,
    campaignArchivedAt,
    deletedAt,
    masteryRate,
    totalStagesCount,
    validatedStagesCount,
    validatedSkillsCount,
  } = {}) {
    this.id = id;
    this.createdAt = createdAt;
    this.targetProfileId = targetProfileId;
    this.isShared = status === SHARED;
    this.sharedAt = sharedAt;
    this.organizationName = organizationName;
    this.status = status;
    this.campaignId = campaignId;
    this.campaignCode = campaignCode;
    this.campaignTitle = campaignTitle;
    this.masteryRate = !_.isNil(masteryRate) ? Number(masteryRate) : null;
    this.validatedSkillsCount = validatedSkillsCount;
    const dates = [deletedAt, campaignArchivedAt].filter((a) => a != null);
    this.totalStagesCount = totalStagesCount;
    this.validatedStagesCount = validatedStagesCount;
    this.disabledAt = _.min(dates) || null;
  }
}

export { CampaignParticipationOverview };
