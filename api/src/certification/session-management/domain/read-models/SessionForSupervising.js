/**
 * @typedef {object} LiveAlert
 * @property {string} status
 * @property {boolean} hasImage
 * @property {boolean} hasAttachment
 * @property {boolean} hasEmbed
 * @property {boolean} isFocus
 */

/**
 * @typedef {object} CandidateView
 * @property {number} id
 * @property {number} userId
 * @property {date} birthdate
 * @property {string} firstName
 * @property {string} lastName
 * @property {number} extraTimePercentage
 * @property {boolean} authorizedToStart
 * @property {string} assessmentStatus
 * @property {date} startDateTime
 * @property {date} theoricalEndDateTime
 * @property {string} subscription
 * @property {boolean} isStillEligibleToDoubleCertification
 * @property {LiveAlert} challengeLiveAlert
 * @property {LiveAlert} companionLiveAlert
 */

class SessionForSupervising {
  /**
   * @param {object} params
   * @param {number} params.id
   * @param {date} params.date
   * @param {string} params.time
   * @param {string} params.examiner
   * @param {string} params.room
   * @param {Array<CandidateView>} params.candidates
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

export { SessionForSupervising };
