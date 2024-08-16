import _ from 'lodash';

import { config } from '../../../../shared/config.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../shared/domain/constants.js';
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
    certificationCenterType,
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
    this.certificationCenterType = certificationCenterType;
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

  get isSco() {
    return this.certificationCenterType === CERTIFICATION_CENTER_TYPES.SCO;
  }

  static generateSupervisorPassword() {
    return _.times(NB_CHAR, _randomCharacter).join('');
  }

  isSessionScheduledInThePast() {
    const sessionDate = new Date(`${this.date}T${this.time}`);
    return sessionDate < new Date();
  }

  isCandidateAlreadyEnrolled({ candidates, candidatePersonalInfo, normalizeStringFnc }) {
    const matchingCandidate = findMatchingCandidate({ candidates, candidatePersonalInfo, normalizeStringFnc });
    return Boolean(matchingCandidate);
  }

  hasLinkedCandidate({ candidates }) {
    return candidates.some((candidate) => candidate.isLinkedToAUser());
  }

  hasLinkedCandidateTo({ candidates, userId }) {
    return candidates.some((candidate) => candidate.isLinkedTo(userId));
  }

  updateInfo(sessionData) {
    this.address = sessionData.address;
    this.room = sessionData.room;
    this.accessCode = sessionData.accessCode;
    this.examiner = sessionData.examiner;
    this.date = sessionData.date;
    this.time = sessionData.time;
    this.description = sessionData.description;
  }

  findCandidateByPersonalInfo({ candidates, candidatePersonalInfo, normalizeStringFnc }) {
    return findMatchingCandidate({ candidates, candidatePersonalInfo, normalizeStringFnc });
  }
}

function findMatchingCandidate({
  candidates,
  candidatePersonalInfo: { firstName, lastName, birthdate },
  normalizeStringFnc,
}) {
  const normalizedInputNames = {
    lastName: normalizeStringFnc(lastName),
    firstName: normalizeStringFnc(firstName),
  };
  const matchingCandidate = candidates.find((enrolledCandidate) => {
    const enrolledCandidatesNormalizedNames = {
      lastName: normalizeStringFnc(enrolledCandidate.lastName),
      firstName: normalizeStringFnc(enrolledCandidate.firstName),
    };
    return (
      _.isEqual(normalizedInputNames, enrolledCandidatesNormalizedNames) && birthdate === enrolledCandidate.birthdate
    );
  });
  return matchingCandidate ?? null;
}

export { SessionEnrolment };

function _randomCharacter() {
  return _.sample(availableCharactersForPasswordGeneration);
}
