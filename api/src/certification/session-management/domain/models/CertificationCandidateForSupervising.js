import lodash from 'lodash';

const { isNil } = lodash;
class CertificationCandidateForSupervising {
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
    duration,
    enrolledComplementaryCertification,
    enrolledDoubleCertification,
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
    this.extraTimePercentage = !isNil(extraTimePercentage) ? parseFloat(extraTimePercentage) : extraTimePercentage;
    this.authorizedToStart = authorizedToStart;
    this.assessmentStatus = assessmentStatus;
    this.startDateTime = startDateTime;
    this.duration = duration;
    this.enrolledComplementaryCertification = enrolledComplementaryCertification;
    this.enrolledDoubleCertification = enrolledDoubleCertification;
    this.stillValidBadgeAcquisitions = stillValidBadgeAcquisitions;
    this.accessibilityAdjustmentNeeded = accessibilityAdjustmentNeeded;
    this.challengeLiveAlert = challengeLiveAlert?.status ? challengeLiveAlert : null;
    this.companionLiveAlert = companionLiveAlert?.status ? companionLiveAlert : null;
  }

  authorizeToStart() {
    this.authorizedToStart = true;
  }

  get isStillEligibleToDoubleCertification() {
    return this.stillValidBadgeAcquisitions.some(
      (stillValidBadgeAcquisition) =>
        stillValidBadgeAcquisition.complementaryCertificationKey === this.enrolledDoubleCertification?.key,
    );
  }
}

export { CertificationCandidateForSupervising };
