// @ts-check

const _ = require('lodash');

/** @typedef {import('./CertificationCandidate')} CertificationCandidate */

const CREATED = 'created';
const FINALIZED = 'finalized';
const IN_PROCESS = 'in_process';
const PROCESSED = 'processed';

/**
 * @enum {string}
 */
const statuses = {
  CREATED,
  FINALIZED,
  IN_PROCESS,
  PROCESSED,
};

const NO_EXAMINER_GLOBAL_COMMENT = null;

class Session {
  /**
   * @param {Object} obj
   * @param {number} [obj.id]
   * @param {string} [obj.accessCode]
   * @param {string} [obj.address]
   * @param {string} [obj.certificationCenter]
   * @param {string} [obj.date]
   * @param {string} [obj.description]
   * @param {string} [obj.examiner]
   * @param {string} [obj.room]
   * @param {string} [obj.time]
   * @param {string | null} [obj.examinerGlobalComment]
   * @param {Date | null} [obj.finalizedAt]
   * @param {Date | null} [obj.resultsSentToPrescriberAt]
   * @param {Date | null} [obj.publishedAt]
   * @param {CertificationCandidate[]} [obj.certificationCandidates]
   * @param {number} [obj.certificationCenterId]
   * @param {number | null} [obj.assignedCertificationOfficerId]
   */
  constructor({
    id,
    accessCode,
    address,
    certificationCenter,
    date,
    description,
    examiner,
    room,
    time,
    examinerGlobalComment,
    finalizedAt,
    resultsSentToPrescriberAt,
    publishedAt,
    certificationCandidates,
    certificationCenterId,
    assignedCertificationOfficerId,
  } = {}) {
    this.id = id;
    this.accessCode = accessCode;
    this.address = address;
    this.certificationCenter = certificationCenter;
    this.date = date;
    this.description = description;
    this.examiner = examiner;
    this.room = room;
    this.time = time;
    this.examinerGlobalComment = examinerGlobalComment;
    this.finalizedAt = finalizedAt;
    this.resultsSentToPrescriberAt = resultsSentToPrescriberAt;
    this.publishedAt = publishedAt;
    this.certificationCandidates = certificationCandidates;
    this.certificationCenterId = certificationCenterId;
    this.assignedCertificationOfficerId = assignedCertificationOfficerId;
  }

  /** @returns {Boolean} */
  areResultsFlaggedAsSent() {
    return !_.isNil(this.resultsSentToPrescriberAt);
  }

  /** @returns {statuses} */
  get status() {
    if (this.publishedAt) {
      return statuses.PROCESSED;
    }
    if (this.assignedCertificationOfficerId) {
      return statuses.IN_PROCESS;
    }
    if (this.finalizedAt) {
      return statuses.FINALIZED;
    }
    return statuses.CREATED;
  }

  /** @returns {Boolean} */
  isPublished() {
    return this.publishedAt !== null;
  }

  isAccessible() {
    return this.status === statuses.CREATED;
  }
}

module.exports = Session;
module.exports.statuses = statuses;
module.exports.NO_EXAMINER_GLOBAL_COMMENT = NO_EXAMINER_GLOBAL_COMMENT;
