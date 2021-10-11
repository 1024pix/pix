const isNil = require('lodash/isNil');

class CertificationCandidateForAttendanceSheet {

  constructor({
    lastName,
    firstName,
    birthdate,
    externalId,
    division,
    extraTimePercentage,
  }) {
    this.lastName = lastName;
    this.firstName = firstName;
    this.birthdate = birthdate;
    this.externalId = externalId;
    this.division = division;
    this.extraTimePercentage = !isNil(extraTimePercentage) ? parseFloat(extraTimePercentage) : extraTimePercentage;
  }
}

module.exports = CertificationCandidateForAttendanceSheet;
