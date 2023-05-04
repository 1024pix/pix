import isNil from 'lodash/isNil';

class CertificationCandidateForSupervising {
  constructor({
    id,
    firstName,
    lastName,
    birthdate,
    extraTimePercentage,
    authorizedToStart,
    assessmentStatus,
    startDateTime,
    complementaryCertification,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.extraTimePercentage = !isNil(extraTimePercentage) ? parseFloat(extraTimePercentage) : extraTimePercentage;
    this.authorizedToStart = authorizedToStart;
    this.assessmentStatus = assessmentStatus;
    this.startDateTime = startDateTime;
    this.complementaryCertification = complementaryCertification;
  }

  authorizeToStart() {
    this.authorizedToStart = true;
  }
}

export { CertificationCandidateForSupervising };
