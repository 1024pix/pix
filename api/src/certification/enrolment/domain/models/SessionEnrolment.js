import _ from 'lodash';

import { CERTIFICATION_CENTER_TYPES } from '../../../../shared/domain/constants.js';
import { SESSION_STATUSES } from '../../../shared/domain/constants.js';
import { CERTIFICATION_VERSIONS } from '../../../shared/domain/models/CertificationVersion.js';

const INVIGILATOR_PASSWORD_LENGTH = 6;
const INVIGILATOR_PASSWORD_CHARS = '23456789bcdfghjkmpqrstvwxyBCDFGHJKMPQRSTVWXY!*?'.split('');

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
    invigilatorPassword,
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
    this.invigilatorPassword = invigilatorPassword ?? this.#generateInvigilatorPassword();
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

  #generateInvigilatorPassword() {
    return _.sampleSize(INVIGILATOR_PASSWORD_CHARS, INVIGILATOR_PASSWORD_LENGTH).join('');
  }

  isSessionScheduledInThePast() {
    const sessionDate = new Date(`${this.date}T${this.time}`);
    return sessionDate < new Date();
  }

  isCandidateAlreadyEnrolled({ candidates, candidatePersonalInfo, normalizeStringFnc }) {
    const matchingCandidates = findMatchingCandidates({ candidates, candidatePersonalInfo, normalizeStringFnc });
    return matchingCandidates.length > 0;
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

  findCandidatesByPersonalInfo({ candidates, candidatePersonalInfo, normalizeStringFnc }) {
    return findMatchingCandidates({ candidates, candidatePersonalInfo, normalizeStringFnc });
  }
}

function findMatchingCandidates({
  candidates,
  candidatePersonalInfo: { firstName, lastName, birthdate },
  normalizeStringFnc,
}) {
  const normalizedInputNames = {
    lastName: normalizeStringFnc(lastName),
    firstName: normalizeStringFnc(firstName),
  };
  return candidates.filter((enrolledCandidate) => {
    const enrolledCandidatesNormalizedNames = {
      lastName: normalizeStringFnc(enrolledCandidate.lastName),
      firstName: normalizeStringFnc(enrolledCandidate.firstName),
    };
    return (
      _.isEqual(normalizedInputNames, enrolledCandidatesNormalizedNames) && birthdate === enrolledCandidate.birthdate
    );
  });
}

export { SessionEnrolment };
