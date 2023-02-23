const { VALIDATED, PENDING } = require('./CertificateStatus.js');

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
    competenceResults,
  } = {}) {
    const isValidated = _isValidated(status);
    const displayScore = _displayScore({ isPublished, isValidated });
    const updatedStatus = isPublished ? status : PENDING;
    const updatedScore = displayScore ? pixScore : 0;
    const updatedCompetenceResults = displayScore ? competenceResults : [];

    return new Certificate({
      id,
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
      competenceResults: updatedCompetenceResults,
    });
  }
}

module.exports = Certificate;

function _isValidated(status) {
  return status === VALIDATED;
}

function _displayScore({ isPublished, isValidated }) {
  return isPublished && isValidated;
}
