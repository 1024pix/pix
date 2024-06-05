/**
 * @typedef {Object} LiveAlert
 * @property {string} status
 * @property {boolean} hasImage
 * @property {boolean} hasAttachment
 * @property {boolean} hasEmbed
 * @property {boolean} isFocus
 */

/**
 * @typedef {Object} ComplementaryCertification
 * @property {string} key
 * @property {string} label
 * @property {number} certificationExtraTime
 */

/**
 * @typedef {Object} CertificationCandidateForSupervising
 * @property {number} id
 * @property {number} userId
 * @property {date} birthdate
 * @property {string} firstName
 * @property {string} lastName
 * @property {number} extraTimePercentage
 * @property {boolean} authorizedToStart
 * @property {date} startDateTime
 * @property {LiveAlert} liveAlert
 * @property {ComplementaryCertification} complementaryCertification
 */

class SessionForSupervising {
  /**
   * @param {Object} params
   * @param {number} params.id
   * @param {date} params.date
   * @param {string} params.time
   * @param {string} params.examiner
   * @param {string} params.room
   * @param {Array<CertificationCandidateForSupervising>} params.certificationCandidates
   * @param {string} params.accessCode
   * @param {string} params.address
   */
  constructor({ id, date, time, examiner, room, certificationCandidates, accessCode, address } = {}) {
    this.id = id;
    this.date = date;
    this.time = time;
    this.examiner = examiner;
    this.room = room;
    this.certificationCandidates = certificationCandidates;
    this.accessCode = accessCode;
    this.address = address;
  }
}

export { SessionForSupervising };
