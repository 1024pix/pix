const _ = require('lodash');
const config = require('../../config');

const CREATED = 'created';
const FINALIZED = 'finalized';
const IN_PROCESS = 'in_process';
const PROCESSED = 'processed';

const availableCharactersForPasswordGeneration =
  `${config.availableCharacterForCode.numbers}${config.availableCharacterForCode.letters}`.split('');
const NB_CHAR = 5;

const statuses = {
  CREATED,
  FINALIZED,
  IN_PROCESS,
  PROCESSED,
};

const NO_EXAMINER_GLOBAL_COMMENT = null;

class Session {
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
    hasIncident,
    hasJoiningIssue,
    finalizedAt,
    resultsSentToPrescriberAt,
    publishedAt,
    certificationCandidates,
    certificationCenterId,
    assignedCertificationOfficerId,
    supervisorPassword,
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
    this.hasIncident = hasIncident;
    this.hasJoiningIssue = hasJoiningIssue;
    this.finalizedAt = finalizedAt;
    this.resultsSentToPrescriberAt = resultsSentToPrescriberAt;
    this.publishedAt = publishedAt;
    this.certificationCandidates = certificationCandidates;
    this.certificationCenterId = certificationCenterId;
    this.assignedCertificationOfficerId = assignedCertificationOfficerId;
    this.supervisorPassword = supervisorPassword;
  }

  areResultsFlaggedAsSent() {
    return !_.isNil(this.resultsSentToPrescriberAt);
  }

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

  isPublished() {
    return this.publishedAt !== null;
  }

  isAccessible() {
    return this.status === statuses.CREATED;
  }

  generateSupervisorPassword() {
    this.supervisorPassword = Session.generateSupervisorPassword();
  }

  static generateSupervisorPassword() {
    return _.times(NB_CHAR, _randomCharacter).join('');
  }

  isSupervisable(supervisorPassword) {
    return this.supervisorPassword === supervisorPassword;
  }

  canEnrollCandidate() {
    return _.isNull(this.finalizedAt);
  }

  isSessionScheduledInThePast() {
    const sessionDate = new Date(`${this.date}T${this.time}`);
    return sessionDate < new Date();
  }
}

module.exports = Session;
module.exports.statuses = statuses;
module.exports.NO_EXAMINER_GLOBAL_COMMENT = NO_EXAMINER_GLOBAL_COMMENT;

function _randomCharacter() {
  return _.sample(availableCharactersForPasswordGeneration);
}
