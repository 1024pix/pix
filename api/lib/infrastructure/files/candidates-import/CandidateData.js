const dayjs = require('dayjs');
dayjs.extend(require('dayjs/plugin/customParseFormat'));
const _ = require('lodash');
const FRANCE_COUNTRY_CODE = '99100';
const CertificationCandidate = require('../../../domain/models/CertificationCandidate.js');
const {
  PIX_PLUS_DROIT,
  CLEA,
  PIX_PLUS_EDU_1ER_DEGRE,
  PIX_PLUS_EDU_2ND_DEGRE,
} = require('../../../domain/models/ComplementaryCertification.js');

module.exports = class CandidateData {
  constructor({
    id = null,
    firstName = null,
    lastName = null,
    sex = null,
    birthPostalCode = null,
    birthINSEECode = null,
    birthCity = null,
    birthProvinceCode = null,
    birthCountry = null,
    email = null,
    resultRecipientEmail = null,
    externalId = null,
    birthdate = null,
    extraTimePercentage = null,
    createdAt = null,
    sessionId = null,
    userId = null,
    organizationLearnerId = null,
    number = null,
    complementaryCertifications = null,
    billingMode = null,
    prepaymentCode = null,
  }) {
    this.id = this._emptyStringIfNull(id);
    this.firstName = this._emptyStringIfNull(firstName);
    this.lastName = this._emptyStringIfNull(lastName);
    this.sex = this._emptyStringIfNull(sex);
    this.birthPostalCode = this._emptyStringIfNull(birthPostalCode);
    this.birthINSEECode = this._emptyStringIfNull(birthINSEECode);
    this.birthCity = this._emptyStringIfNull(birthCity);
    this.birthProvinceCode = this._emptyStringIfNull(birthProvinceCode);
    this.birthCountry = this._emptyStringIfNull(birthCountry);
    this.email = this._emptyStringIfNull(email);
    this.resultRecipientEmail = this._emptyStringIfNull(resultRecipientEmail);
    this.externalId = this._emptyStringIfNull(externalId);
    this.birthdate = birthdate === null ? '' : dayjs(birthdate, 'YYYY-MM-DD').format('YYYY-MM-DD');
    if (!_.isFinite(extraTimePercentage) || extraTimePercentage <= 0) {
      this.extraTimePercentage = '';
    } else {
      this.extraTimePercentage = extraTimePercentage;
    }
    this.createdAt = this._emptyStringIfNull(createdAt);
    this.sessionId = this._emptyStringIfNull(sessionId);
    this.userId = this._emptyStringIfNull(userId);
    this.organizationLearnerId = this._emptyStringIfNull(organizationLearnerId);
    this.billingMode = CertificationCandidate.translateBillingMode(billingMode);
    this.prepaymentCode = this._emptyStringIfNull(prepaymentCode);
    this.cleaNumerique = this._displayYesIfCandidateHasComplementaryCertification(complementaryCertifications, CLEA);
    this.pixPlusDroit = this._displayYesIfCandidateHasComplementaryCertification(
      complementaryCertifications,
      PIX_PLUS_DROIT
    );
    this.pixPlusEdu1erDegre = this._displayYesIfCandidateHasComplementaryCertification(
      complementaryCertifications,
      PIX_PLUS_EDU_1ER_DEGRE
    );
    this.pixPlusEdu2ndDegre = this._displayYesIfCandidateHasComplementaryCertification(
      complementaryCertifications,
      PIX_PLUS_EDU_2ND_DEGRE
    );
    this.count = number;
    this._clearBirthInformationDataForExport();
  }

  _emptyStringIfNull(value) {
    return value === null ? '' : value;
  }

  _clearBirthInformationDataForExport() {
    if (this.birthCountry.toUpperCase() === 'FRANCE') {
      if (this.birthINSEECode) {
        this.birthPostalCode = '';
        this.birthCity = '';
      }

      return;
    }

    if (this.birthINSEECode && this.birthINSEECode !== FRANCE_COUNTRY_CODE) {
      this.birthINSEECode = '99';
    }
  }

  _displayYesIfCandidateHasComplementaryCertification(complementaryCertifications, certificationKey) {
    if (!complementaryCertifications) {
      return '';
    }
    const hasComplementaryCertification = complementaryCertifications.some(
      (complementaryCertification) => complementaryCertification.key === certificationKey
    );
    return hasComplementaryCertification ? 'oui' : '';
  }

  static fromCertificationCandidateAndCandidateNumber(certificationCandidate, number) {
    return new CandidateData({ ...certificationCandidate, number });
  }

  static empty(number) {
    return new CandidateData({ number });
  }
};
