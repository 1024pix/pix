const { VALIDATED, PENDING } = require('./CertificateStatus');
const sortBy = require('lodash/sortBy');

class Certificate {

  constructor({
    id,
    firstName,
    middleName,
    thirdName,
    lastName,
    birthdate,
    nationalStudentId,
    status,
    pixScore,
    verificationCode,
    date,
    deliveredAt,
    certificationCenter,
    competenceResults = [],
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.middleName = middleName;
    this.thirdName = thirdName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.nationalStudentId = nationalStudentId;
    this.date = date;
    this.deliveredAt = deliveredAt;
    this.pixScore = pixScore;
    this.status = status;
    this.competenceResults = competenceResults;
    this.certificationCenter = certificationCenter;
    this.verificationCode = verificationCode;
  }

  static from({
    id,
    firstName,
    middleName,
    thirdName,
    lastName,
    birthdate,
    nationalStudentId,
    isPublished,
    status,
    pixScore,
    verificationCode,
    date,
    deliveredAt,
    certificationCenter,
    competenceResultsJson,
  } = {}) {
    const isValidated = _isValidated(status);
    const updatedStatus = (isPublished) ? status : PENDING;
    const updatedScore = isValidated ? pixScore : 0;
    const competenceResults = _getExtractValidatedCompetenceResults(isValidated, competenceResultsJson);

    return new Certificate({ id,
      firstName,
      middleName,
      thirdName,
      lastName,
      birthdate,
      nationalStudentId,
      isPublished,
      status: updatedStatus,
      pixScore: updatedScore,
      verificationCode,
      date,
      deliveredAt,
      certificationCenter,
      competenceResults,
    });
  }
}

module.exports = Certificate;

function _isValidated(status) {
  return status === VALIDATED;
}

function _getExtractValidatedCompetenceResults(isValidated, competenceResultsJson) {
  if (isValidated) {
    const competenceResults = JSON.parse(competenceResultsJson);
    return sortBy(competenceResults, 'competenceId');
  }
  return [];
}

