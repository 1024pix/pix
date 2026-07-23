export class CertificationCandidateForSupervising {
  constructor({
    id,
    userId,
    firstName,
    lastName,
    birthdate,
    extraTimePercentage,
    authorizedToStart,
    assessmentStatus,
    startDateTime,
    assessmentDuration,
    subscription,
    stillValidBadgeAcquisitions = [],
    accessibilityAdjustmentNeeded,
    challengeLiveAlert,
    companionLiveAlert,
  } = {}) {
    this.id = id;
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.extraTimePercentage = extraTimePercentage != null ? parseFloat(extraTimePercentage) : extraTimePercentage;
    this.authorizedToStart = authorizedToStart;
    this.assessmentStatus = assessmentStatus;
    this.assessmentDuration = assessmentDuration;
    this.startDateTime = startDateTime;
    this.subscription = subscription;
    this.stillValidBadgeAcquisitions = stillValidBadgeAcquisitions;
    this.accessibilityAdjustmentNeeded = accessibilityAdjustmentNeeded;
    this.challengeLiveAlert = challengeLiveAlert?.status ? challengeLiveAlert : null;
    this.companionLiveAlert = companionLiveAlert?.status ? companionLiveAlert : null;
  }

  authorizeToStart() {
    this.authorizedToStart = true;
  }
}
