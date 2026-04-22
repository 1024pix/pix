import { Frameworks } from '../../../shared/domain/models/Frameworks.js';

export class Candidate {
  /**
   * @param {object} params
   * @param {number} params.id
   * @param {number} params.userId
   * @param {number} params.sessionId
   * @param {string} params.firstName
   * @param {string} params.lastName
   * @param {string} params.sex
   * @param {string} params.birthdate
   * @param {string} params.birthPostalCode
   * @param {string} params.birthINSEECode
   * @param {string} params.birthCountry
   * @param {string} params.birthCity
   * @param {string} params.externalId
   * @param {Date} params.reconciledAt
   * @param {boolean} [params.accessibilityAdjustmentNeeded]
   * @param {Frameworks} params.subscriptionFramework
   * @param {boolean} params.authorizedToStart
   */
  constructor({
    id,
    userId,
    sessionId,
    firstName,
    lastName,
    sex,
    birthdate,
    birthPostalCode,
    birthINSEECode,
    birthCountry,
    birthCity,
    externalId,
    accessibilityAdjustmentNeeded,
    reconciledAt,
    subscriptionFramework,
    authorizedToStart,
  }) {
    this.id = id;
    this.userId = userId;
    this.sessionId = sessionId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.sex = sex;
    this.birthdate = birthdate;
    this.birthPostalCode = birthPostalCode;
    this.birthINSEECode = birthINSEECode;
    this.birthCountry = birthCountry;
    this.birthCity = birthCity;
    this.externalId = externalId;
    this.accessibilityAdjustmentNeeded = !!accessibilityAdjustmentNeeded;
    this.reconciledAt = reconciledAt;
    this.subscriptionFramework = subscriptionFramework;
    this.authorizedToStart = authorizedToStart;
  }

  get hasSubscribedToClea() {
    return this.subscriptionFramework === Frameworks.CLEA;
  }

  get hasSubscribedToSomethingElseButCore() {
    return this.subscriptionFramework !== Frameworks.CORE;
  }
}
