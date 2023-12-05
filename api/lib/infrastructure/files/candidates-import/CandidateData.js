import dayjs from 'dayjs';
import _ from 'lodash';
const FRANCE_COUNTRY_CODE = '99100';
import { CertificationCandidate } from '../../../domain/models/CertificationCandidate.js';
import {
  PIX_PLUS_DROIT,
  CLEA,
  PIX_PLUS_EDU_1ER_DEGRE,
  PIX_PLUS_EDU_2ND_DEGRE,
} from '../../../domain/models/ComplementaryCertification.js';

class CandidateData {
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
    complementaryCertification = null,
    billingMode = null,
    prepaymentCode = null,
    i18n = null,
  }) {
    this.translate = i18n.__;
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
    this.billingMode = CertificationCandidate.translateBillingMode({ billingMode, translate: this.translate });
    this.prepaymentCode = this._emptyStringIfNull(prepaymentCode);
    this.cleaNumerique = this._displayYesIfCandidateHasComplementaryCertification(complementaryCertification, CLEA);
    this.pixPlusDroit = this._displayYesIfCandidateHasComplementaryCertification(
      complementaryCertification,
      PIX_PLUS_DROIT,
    );
    this.pixPlusEdu1erDegre = this._displayYesIfCandidateHasComplementaryCertification(
      complementaryCertification,
      PIX_PLUS_EDU_1ER_DEGRE,
    );
    this.pixPlusEdu2ndDegre = this._displayYesIfCandidateHasComplementaryCertification(
      complementaryCertification,
      PIX_PLUS_EDU_2ND_DEGRE,
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

  _displayYesIfCandidateHasComplementaryCertification(complementaryCertification, certificationKey) {
    if (!complementaryCertification) {
      return '';
    }
    const hasComplementaryCertification = complementaryCertification.key === certificationKey;
    return hasComplementaryCertification ? this.translate('candidate-list-template.yes') : '';
  }

  static fromCertificationCandidateAndCandidateNumber({ certificationCandidate, number, i18n }) {
    return new CandidateData({ ...certificationCandidate, number, i18n });
  }

  static empty({ number, i18n }) {
    return new CandidateData({ number, i18n });
  }
}

export { CandidateData };
