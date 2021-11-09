const isNil = require('lodash/isNil');

class CertificationCandidateForSupervising {
  constructor({ id, firstName, lastName, birthdate, extraTimePercentage, authorizedToStart } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.extraTimePercentage = !isNil(extraTimePercentage) ? parseFloat(extraTimePercentage) : extraTimePercentage;
    this.authorizedToStart = authorizedToStart;
  }
}

module.exports = CertificationCandidateForSupervising;
