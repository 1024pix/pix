import dayjs from 'dayjs';

import { MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING } from '../../../../shared/constants.js';
import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';
class PreviousCampaignParticipation {
  #isResetAllowed;
  constructor({
    id,
    participantExternalId,
    validatedSkillsCount,
    status,
    isDeleted,
    isTargetProfileResetAllowed,
    isOrganizationLearnerActive,
    isCampaignMultipleSendings,
    isResetAllowed,
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
    this.#isResetAllowed = isResetAllowed;
  }

  get canReset() {
    return (
      this.#isResetAllowed &&
      this.status === CampaignParticipationStatuses.SHARED &&
      this.isTargetProfileResetAllowed &&
      this.isCampaignMultipleSendings &&
      this.isOrganizationLearnerActive &&
      this._isTimeBeforeRetryingPassed(this.sharedAt)
    );
  }

  _isTimeBeforeRetryingPassed(sharedAt) {
    return dayjs().diff(sharedAt, 'days') >= MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING;
  }
}

export { PreviousCampaignParticipation };
