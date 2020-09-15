const _ = require('lodash');
const moment = require('moment');
const { statuses } = require('../../infrastructure/repositories/clea-certification-status-repository');

class CertificationAttestation {
  constructor({
    id,
    firstName,
    lastName,
    birthdate,
    birthplace,
    isPublished,
    userId,
    date,
    deliveredAt,
    certificationCenter,
    pixScore,
    status,
    cleaCertificationStatus,
    resultCompetenceTree = null,
    verificationCode,
  } = {}) {
    this.id = id;
    this.firstName = _.startCase(firstName);
    this.lastName = _.startCase(lastName);
    this.birthdate = birthdate;
    this.birthplace = birthplace;
    this.isPublished = isPublished;
    this.userId = userId;
    this.date = date;
    this.deliveredAt = moment(deliveredAt).locale('fr').format('LL');
    this.certificationCenter = certificationCenter;
    this.pixScore = pixScore;
    this.status = status;
    this.hasAcquiredCleaCertification = cleaCertificationStatus === statuses.ACQUIRED;
    this.resultCompetenceTree = resultCompetenceTree;
    this.verificationCode = verificationCode;
  }
}

module.exports = CertificationAttestation;
