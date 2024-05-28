import _ from 'lodash';

import { config } from '../../../../shared/config.js';
import { SESSION_STATUSES } from '../../../shared/domain/constants.js';
import { CERTIFICATION_VERSIONS } from '../../../shared/domain/models/CertificationVersion.js';

const availableCharactersForPasswordGeneration =
  `${config.availableCharacterForCode.numbers}${config.availableCharacterForCode.letters}`.split('');
const NB_CHAR = 5;

class SessionEnrolment {
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
    certificationCandidates,
    certificationCenterId,
    supervisorPassword = SessionEnrolment.generateSupervisorPassword(),
    version = CERTIFICATION_VERSIONS.V2,
    createdBy,
    finalizedAt,
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
    this.certificationCandidates = certificationCandidates;
    this.certificationCenterId = certificationCenterId;
    this.supervisorPassword = supervisorPassword;
    this.version = version;
    this.createdBy = createdBy;
    this.canEnrolCandidate = !finalizedAt;
  }

  get status() {
    return SESSION_STATUSES.CREATED;
  }

  static generateSupervisorPassword() {
    return _.times(NB_CHAR, _randomCharacter).join('');
  }

  isSessionScheduledInThePast() {
    const sessionDate = new Date(`${this.date}T${this.time}`);
    return sessionDate < new Date();
  }
}

export { SessionEnrolment };

function _randomCharacter() {
  return _.sample(availableCharactersForPasswordGeneration);
}
