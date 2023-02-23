const EuropeanNumericLevelFactory = require('./EuropeanNumericLevelFactory.js');

class CpfCertificationResult {
  constructor({
    id,
    firstName,
    lastName,
    birthdate,
    sex,
    birthINSEECode,
    birthPostalCode,
    birthplace,
    birthCountry,
    publishedAt,
    pixScore,
    competenceMarks,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.sex = sex;
    this.birthINSEECode = birthINSEECode;
    this.birthPostalCode = birthPostalCode;
    this.birthplace = birthplace;
    this.birthCountry = birthCountry;
    this.publishedAt = publishedAt;
    this.pixScore = pixScore;
    this.competenceMarks = competenceMarks;
  }

  get europeanNumericLevels() {
    return EuropeanNumericLevelFactory.buildFromCompetenceMarks(this.competenceMarks);
  }

  get inseeCode() {
    if (!this.birthINSEECode) return null;
    if (this.birthINSEECode.length !== 5) return null;
    return this.birthINSEECode;
  }

  get countryCode() {
    if (!this.birthINSEECode) return null;
    if (!this.birthINSEECode.startsWith('99')) return null;
    return this.birthINSEECode.slice(2);
  }

  get postalCode() {
    if (!this.birthPostalCode) return null;
    if (this.birthPostalCode.length !== 5) return null;
    return this.birthPostalCode;
  }
}

module.exports = CpfCertificationResult;
