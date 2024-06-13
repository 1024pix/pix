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
    theoricalEndDateTime,
    enrolledComplementaryCertification,
    isComplementaryCertificationInProgress,
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
    this.theoricalEndDateTime = theoricalEndDateTime;
    this.enrolledComplementaryCertification = enrolledComplementaryCertification;
    this.isComplementaryCertificationInProgress = isComplementaryCertificationInProgress;
  }

  authorizeToStart() {
    this.authorizedToStart = true;
  }

  get isStillEligibleToComplementaryCertification() {
    return this.isComplementaryCertificationInProgress;
  }
}

export { CertificationCandidateForSupervising };
