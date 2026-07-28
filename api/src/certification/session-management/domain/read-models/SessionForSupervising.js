const AUTHORIZED_TO_START_DURATION_VALIDITY_IN_MS = 15 * 60 * 1000; // 15min
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
   */
  constructor({ id, date, time, examiner, room, candidates, accessCode, address } = {}) {
    this.id = id;
    this.date = date;
    this.time = time;
    this.examiner = examiner;
    this.room = room;
    this.accessCode = accessCode;
    this.candidates = candidates;
    this.address = address;
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

  #elapsedTimeSinceInvigilatorAuthorizedToStart() {
    return Date.now() - this.authorizedToStartAt.getTime();
  }
}
