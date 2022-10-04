const EuropeanNumericLevelFactory = require('./EuropeanNumericLevelFactory');

class CpfCertificationResult {
  constructor({
    id,
    firstName,
    lastName,
    birthdate,
    sex,
    birthINSEECode,
    birthPostalCode,
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
    this.publishedAt = publishedAt;
    this.pixScore = pixScore;
    this.competenceMarks = competenceMarks;
  }

  get europeanNumericLevels() {
    return EuropeanNumericLevelFactory.buildFromCompetenceMarks(this.competenceMarks);
  }

  get inseeCode() {
    if (!this.birthINSEECode) return null;
    if (this.birthINSEECode === 'NULL' || this.birthINSEECode.length !== 5) return null;
    return this.birthINSEECode;
  }
}

module.exports = CpfCertificationResult;
