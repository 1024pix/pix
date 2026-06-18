import dayjs from 'dayjs';

import { Candidate } from '../../../enrolment/domain/models/Candidate.js';
import { Frameworks } from '../../../shared/domain/models/Frameworks.js';

const FRANCE_COUNTRY_CODE = '99100';

export class CandidateData {
  /**
   * @param {object} params
   */
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
    subscription = null,
    billingMode = null,
    prepaymentCode = null,
    i18n = null,
  }) {
    this.translate = i18n.__;
    this.id = id || '';
    this.firstName = firstName || '';
    this.lastName = lastName || '';
    this.sex = sex || '';
    this.birthProvinceCode = birthProvinceCode || '';
    this.birthCountry = birthCountry || '';
    this.email = email || '';
    this.resultRecipientEmail = resultRecipientEmail || '';
    this.externalId = externalId || '';
    this.birthdate = birthdate === null ? '' : dayjs(birthdate, 'YYYY-MM-DD').format('YYYY-MM-DD');
    this.createdAt = createdAt || '';
    this.sessionId = sessionId || '';
    this.userId = userId || '';
    this.organizationLearnerId = organizationLearnerId || '';
    this.billingMode = Candidate.translateBillingMode({
      billingMode,
      translate: this.translate,
    });
    this.prepaymentCode = prepaymentCode || '';
    this.count = number;
    this.#setBirthCityAndPostalCode(birthCity, birthCountry, birthINSEECode, birthPostalCode);
    this.#setKindOfCertificationAttributes(subscription);
    this.#setBirthINSEECode(birthINSEECode, birthCountry);
    this.#setExtraTimePercentage(extraTimePercentage);
  }

  #setKindOfCertificationAttributes(subscription) {
    const yes = this.translate('candidate-list-template.yes');

    Object.keys(Frameworks).forEach((key) => {
      this[key] = subscription === key ? yes : '';
    });
  }

  #setBirthCityAndPostalCode(birthCity, birthCountry, birthINSEECode, birthPostalCode) {
    const birthInFranceWithCodeINSEE = birthCountry?.toUpperCase() === 'FRANCE' && birthINSEECode;
    this.birthCity = birthCity === null || birthInFranceWithCodeINSEE ? '' : birthCity;
    this.birthPostalCode = birthPostalCode === null || birthInFranceWithCodeINSEE ? '' : birthPostalCode;
  }

  #setBirthINSEECode(birthINSEECode, birthCountry) {
    if (birthCountry?.toUpperCase() !== 'FRANCE' && birthINSEECode && birthINSEECode !== FRANCE_COUNTRY_CODE) {
      this.birthINSEECode = '99';
    } else {
      this.birthINSEECode = birthINSEECode || '';
    }
  }

  #setExtraTimePercentage(extraTimePercentage) {
    if (Number.isFinite(extraTimePercentage) && extraTimePercentage > 0) {
      this.extraTimePercentage = extraTimePercentage;
    } else {
      this.extraTimePercentage = '';
    }
  }

  static empty({ number, i18n }) {
    return new CandidateData({ number, i18n });
  }
}
