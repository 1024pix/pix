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
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.extraTimePercentage = !isNil(extraTimePercentage) ? parseFloat(extraTimePercentage) : extraTimePercentage;
    this.authorizedToStart = authorizedToStart;
    this.assessmentStatus = assessmentStatus;
    this.startDateTime = startDateTime;
  }

  authorizeToStart() {
    this.authorizedToStart = true;
  }
}

export default CertificationCandidateForSupervising;
