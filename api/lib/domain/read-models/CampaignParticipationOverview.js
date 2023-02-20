import _ from 'lodash';
import CampaignParticipationStatuses from '../models/CampaignParticipationStatuses';

const { SHARED } = CampaignParticipationStatuses;

class CampaignParticipationOverview {
  constructor({
    id,
    createdAt,
    sharedAt,
    organizationName,
    status,
    campaignCode,
    campaignTitle,
    campaignArchivedAt,
    deletedAt,
    campaignStages,
    masteryRate,
  } = {}) {
    this.id = id;
    this.createdAt = createdAt;
    this.isShared = status === SHARED;
    this.sharedAt = sharedAt;
    this.organizationName = organizationName;
    this.status = status;
    this.campaignCode = campaignCode;
    this.campaignTitle = campaignTitle;
    this.campaignStages = campaignStages;
    this.masteryRate = !_.isNil(masteryRate) ? Number(masteryRate) : null;

    const dates = [deletedAt, campaignArchivedAt].filter((a) => a != null);

    this.disabledAt = _.min(dates) || null;
  }

  get validatedStagesCount() {
    if (_.isEmpty(this.campaignStages?.stages) || !this.isShared) return null;

    const validatedStages = this.campaignStages.reachableStages.filter(
      (stage) => stage.threshold <= this.masteryRate * 100
    );
    return validatedStages.length;
  }

  get totalStagesCount() {
    return this.campaignStages?.reachableStages?.length ?? 0;
  }
}

export default CampaignParticipationOverview;
