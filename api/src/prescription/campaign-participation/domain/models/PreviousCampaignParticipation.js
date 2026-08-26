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
  }) {
    this.id = id;
    this.participantExternalId = participantExternalId;
    this.validatedSkillsCount = validatedSkillsCount;
    this.status = status;
    this.isDeleted = isDeleted;
    this.isTargetProfileResetAllowed = isTargetProfileResetAllowed;
    this.isOrganizationLearnerActive = isOrganizationLearnerActive;
    this.isCampaignMultipleSendings = isCampaignMultipleSendings;
    this.#isResetAllowed = isResetAllowed;
  }

  get canReset() {
    return (
      this.#isResetAllowed &&
      this.status === CampaignParticipationStatuses.SHARED &&
      this.isTargetProfileResetAllowed &&
      this.isCampaignMultipleSendings &&
      this.isOrganizationLearnerActive
    );
  }
}

export { PreviousCampaignParticipation };
