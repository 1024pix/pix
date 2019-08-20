const _ = require('lodash');

class CertificationCandidate {
  constructor(
    {
      id,
      // attributes
      firstName,
      lastName,
      birthplace,
      externalId,
      birthdate,
      createdAt,
      extraTimePercentage,
      // includes
      // references
      sessionId,
    } = {}) {
    this.id = id;
    // attributes
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthplace = birthplace;
    this.externalId = externalId;
    this.birthdate = birthdate;
    this.createdAt = createdAt;
    this.extraTimePercentage = !_.isNil(extraTimePercentage) ? parseFloat(extraTimePercentage) : null;
    // includes
    // references
    this.sessionId = sessionId;
  }
}

module.exports = CertificationCandidate;
