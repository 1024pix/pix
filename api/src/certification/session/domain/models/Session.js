import _ from 'lodash';

import { config } from '../../../../shared/config.js';
import { SESSION_STATUSES } from '../../../shared/domain/constants.js';
import { CertificationVersion } from '../../../shared/domain/models/CertificationVersion.js';

const availableCharactersForPasswordGeneration =
  `${config.availableCharacterForCode.numbers}${config.availableCharacterForCode.letters}`.split('');
const NB_CHAR = 5;

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
    supervisorPassword = Session.generateSupervisorPassword(),
    version = CertificationVersion.V2,
    createdBy,
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
    this.version = version;
    this.createdBy = createdBy;
  }

  areResultsFlaggedAsSent() {
    return !_.isNil(this.resultsSentToPrescriberAt);
  }

  get status() {
    if (this.publishedAt) {
      return SESSION_STATUSES.PROCESSED;
    }
    if (this.assignedCertificationOfficerId) {
      return SESSION_STATUSES.IN_PROCESS;
    }
    if (this.finalizedAt) {
      return SESSION_STATUSES.FINALIZED;
    }
    return SESSION_STATUSES.CREATED;
  }

  isPublished() {
    return this.publishedAt !== null;
  }

  isAccessible() {
    return this.status === SESSION_STATUSES.CREATED;
  }

  static generateSupervisorPassword() {
    return _.times(NB_CHAR, _randomCharacter).join('');
  }

  isSupervisable(supervisorPassword) {
    return this.supervisorPassword === supervisorPassword;
  }

  canEnrolCandidate() {
    return _.isNull(this.finalizedAt);
  }

  isSessionScheduledInThePast() {
    const sessionDate = new Date(`${this.date}T${this.time}`);
    return sessionDate < new Date();
  }
}

export { NO_EXAMINER_GLOBAL_COMMENT, Session };

function _randomCharacter() {
  return _.sample(availableCharactersForPasswordGeneration);
}
