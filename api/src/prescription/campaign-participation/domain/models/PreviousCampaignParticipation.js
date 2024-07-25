import dayjs from 'dayjs';

import { MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING } from '../../../../shared/domain/constants.js';

class PreviousCampaignParticipation {
  constructor({
    id,
    participantExternalId,
    validatedSkillsCount,
    status,
    isDeleted,
    isTargetProfileResetAllowed,
    isOrganizationLearnerActive,
    isCampaignMultipleSendings,
    sharedAt,
  }) {
    this.id = id;
    this.participantExternalId = participantExternalId;
    this.validatedSkillsCount = validatedSkillsCount;
    this.status = status;
    this.isDeleted = isDeleted;
    this.isTargetProfileResetAllowed = isTargetProfileResetAllowed;
    this.isOrganizationLearnerActive = isOrganizationLearnerActive;
    this.isCampaignMultipleSendings = isCampaignMultipleSendings;
    this.sharedAt = sharedAt;
  }

  get canReset() {
    return (
      this.isTargetProfileResetAllowed &&
      this.isCampaignMultipleSendings &&
      this.isOrganizationLearnerActive &&
      this._isTimeBeforeRetryingPassed(this.sharedAt)
    );
  }

  _isTimeBeforeRetryingPassed(sharedAt) {
    const isShared = Boolean(sharedAt);
    if (!isShared) return false;

    return dayjs().diff(sharedAt, 'days') >= MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING;
  }
}

export { PreviousCampaignParticipation };
