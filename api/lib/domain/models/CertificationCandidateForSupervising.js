const isNil = require('lodash/isNil');

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
    enrolledComplementaryCertificationKey,
    stillValidBadgeAcquisitions = [],
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
    this.enrolledComplementaryCertificationKey = enrolledComplementaryCertificationKey;
    this.stillValidBadgeAcquisitions = stillValidBadgeAcquisitions;
  }

  authorizeToStart() {
    this.authorizedToStart = true;
  }

  get isStillEligibleToComplementaryCertification() {
    return this.stillValidBadgeAcquisitions.some(
      (stillValidBadgeAcquisition) =>
        stillValidBadgeAcquisition.complementaryCertificationBadgeLabel === this.enrolledComplementaryCertification
    );
  }
}

module.exports = CertificationCandidateForSupervising;
