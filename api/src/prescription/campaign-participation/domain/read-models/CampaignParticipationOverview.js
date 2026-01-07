import dayjs from 'dayjs';
import _ from 'lodash';

import { MAX_MASTERY_RATE, MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING } from '../../../../shared/domain/constants.js';
import { CampaignParticipationStatuses, CampaignTypes } from '../../../shared/domain/constants.js';

const { SHARED, TO_SHARE, STARTED } = CampaignParticipationStatuses;

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
    campaignName,
    campaignArchivedAt,
    deletedAt,
    masteryRate,
    totalStagesCount,
    validatedStagesCount,
    validatedSkillsCount,
    isCampaignMultipleSendings,
    isOrganizationLearnerDisabled,
    campaignType,
    updatedAt,
    modifystatus = true,
  } = {}) {
    this.id = id;
    this.createdAt = createdAt;
    this.targetProfileId = targetProfileId;
    this.isShared = status === SHARED;
    this.sharedAt = sharedAt;
    this.organizationName = organizationName;
    if (modifystatus)
      this.status = status === TO_SHARE ? STARTED : status; // TODO: remove this mapping once the status is migrated
    else this.status = status;
    this.campaignId = campaignId;
    this.campaignCode = campaignCode;
    this.campaignTitle = campaignTitle;
    this.campaignName = campaignName;
    this.masteryRate = !_.isNil(masteryRate) ? Number(masteryRate) : null;
    this.validatedSkillsCount = validatedSkillsCount;
    const dates = [deletedAt, campaignArchivedAt].filter((a) => a != null);
    this.totalStagesCount = totalStagesCount;
    this.validatedStagesCount = validatedStagesCount;
    this.disabledAt = _.min(dates) || null;
    this.isDisabled = this.disabledAt !== null;
    this.isCampaignMultipleSendings = isCampaignMultipleSendings;
    this.isOrganizationLearnerDisabled = isOrganizationLearnerDisabled;
    this.campaignType = campaignType;
    this.updatedAt = updatedAt;
    this.canRetry = this.computeCanRetry();
  }

  computeCanRetry() {
    return (
      !this.isOrganizationLearnerDisabled &&
      !this.isDisabled &&
      this.isCampaignMultipleSendings &&
      this.isShared &&
      this._timeBeforeRetryingPassed(this.sharedAt) &&
      (this.masteryRate < MAX_MASTERY_RATE || this.campaignType === CampaignTypes.EXAM)
    );
  }

  _timeBeforeRetryingPassed(sharedAt) {
    return sharedAt ? dayjs().diff(sharedAt, 'days', true) >= MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING : false;
  }

  set stagesStatus({ totalStages, reachedStages }) {
    this.totalStagesCount = totalStages;
    this.validatedStagesCount = reachedStages;
  }
}

export { CampaignParticipationOverview };
