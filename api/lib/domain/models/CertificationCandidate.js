class CertificationCandidate {
  constructor(
    {
      id,
      // attributes
      firstName,
      lastName,
      birthCountry,
      birthProvince,
      birthCity,
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
    this.birthCountry = birthCountry;
    this.birthProvince = birthProvince;
    this.birthCity = birthCity;
    this.externalId = externalId;
    this.birthdate = birthdate;
    this.createdAt = createdAt;
    this.extraTimePercentage = extraTimePercentage;
    // includes
    // references
    this.sessionId = sessionId;
  }
}

module.exports = CertificationCandidate;
