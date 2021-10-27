const isNil = require('lodash/isNil');

class CertificationCandidateForSupervising {
  constructor({ id, firstName, lastName, birthdate, extraTimePercentage } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.extraTimePercentage = !isNil(extraTimePercentage) ? parseFloat(extraTimePercentage) : extraTimePercentage;
  }
}

module.exports = CertificationCandidateForSupervising;
