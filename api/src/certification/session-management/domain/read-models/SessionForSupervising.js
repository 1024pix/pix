import {
  AUTHORIZED_TO_START_DURATION_VALIDITY_IN_MS,
  MAXIMAL_CERTIFICATION_DURATION_IN_MS,
  MAXIMAL_SESSION_DURATION_IN_MS,
} from '../constants.js';

/**
 * @typedef {object} LiveAlert
 * @property {string} status
 * @property {boolean} hasImage
 * @property {boolean} hasAttachment
 * @property {boolean} hasEmbed
 * @property {boolean} isFocus
 */

export class SessionForSupervising {
  /**
   * @param {object} params
   * @param {number} params.id
   * @param {date} params.date
   * @param {string} params.time
   * @param {string} params.examiner
   * @param {string} params.room
   * @param {Array<CandidateForSupervising>} params.candidates
   * @param {string} params.accessCode
   * @param {string} params.address
   * @param {Date|null} params.firstCertificationStartedAt
   */
  constructor({ id, date, time, examiner, room, candidates, accessCode, address, firstCertificationStartedAt }) {
    this.id = id;
    this.date = date;
    this.time = time;
    this.examiner = examiner;
    this.room = room;
    this.accessCode = accessCode;
    this.candidates = candidates;
    this.address = address;
    this.firstCertificationStartedAt = firstCertificationStartedAt;
  }

  get hasExpired() {
    const hasACertificationOnGoing = Boolean(this.firstCertificationStartedAt);
    if (hasACertificationOnGoing) {
      return this.#elapsedTimeSinceSessionStarted() > MAXIMAL_SESSION_DURATION_IN_MS;
    }
    return false;
  }

  #elapsedTimeSinceSessionStarted() {
    return Date.now() - this.firstCertificationStartedAt.getTime();
  }
}

export class CandidateForSupervising {
  /**
   * @param {object} params
   * @param {number} params.id
   * @param {number} params.userId
   * @param {string} params.birthdate
   * @param {string} params.firstName
   * @param {string} params.lastName
   * @param {number} params.extraTimePercentage
   * @param {Date} params.authorizedToStartAt
   * @param {string} params.assessmentStatus
   * @param {date} params.startDateTime
   * @param {date} params.theoricalEndDateTime
   * @param {string} params.subscription
   * @param {boolean} params.isStillEligibleToDoubleCertification
   * @param {LiveAlert} params.challengeLiveAlert
   * @param {LiveAlert} params.companionLiveAlert
   */
  constructor({
    id,
    userId,
    birthdate,
    firstName,
    lastName,
    extraTimePercentage,
    authorizedToStartAt,
    certificationStartedAt,
    assessmentStatus,
    startDateTime,
    theoricalEndDateTime,
    subscription,
    isStillEligibleToDoubleCertification,
    challengeLiveAlert,
    companionLiveAlert,
  }) {
    this.id = id;
    this.userId = userId;
    this.birthdate = birthdate;
    this.firstName = firstName;
    this.lastName = lastName;
    this.extraTimePercentage = extraTimePercentage;
    this.authorizedToStartAt = authorizedToStartAt;
    this.certificationStartedAt = certificationStartedAt;
    this.assessmentStatus = assessmentStatus;
    this.startDateTime = startDateTime;
    this.theoricalEndDateTime = theoricalEndDateTime;
    this.subscription = subscription;
    this.isStillEligibleToDoubleCertification = isStillEligibleToDoubleCertification;
    this.challengeLiveAlert = challengeLiveAlert;
    this.companionLiveAlert = companionLiveAlert;
  }

  get authorizedToStart() {
    if (this.authorizedToStartAt) {
      return this.#elapsedTimeSinceInvigilatorAuthorizedToStart() < AUTHORIZED_TO_START_DURATION_VALIDITY_IN_MS;
    }
    return false;
  }

  get hasExceededCertificationDuration() {
    const hasACertificationOnGoing = Boolean(this.startDateTime);
    if (hasACertificationOnGoing) {
      return this.#elapsedTimeSinceCertificationStarted() > MAXIMAL_CERTIFICATION_DURATION_IN_MS;
    }
    return false;
  }

  #elapsedTimeSinceCertificationStarted() {
    return Date.now() - this.startDateTime.getTime();
  }

  #elapsedTimeSinceInvigilatorAuthorizedToStart() {
    return Date.now() - this.authorizedToStartAt.getTime();
  }
}
