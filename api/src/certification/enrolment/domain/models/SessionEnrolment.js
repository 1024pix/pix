/**
 * @typedef {import('./Candidate.js').Candidate} Candidate
 */
import { CERTIFICATION_CENTER_TYPES } from '../../../../shared/constants.js';
import { SESSION_STATUSES } from '../../../shared/domain/constants.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';

const INVIGILATOR_PASSWORD_LENGTH = 6;
const INVIGILATOR_PASSWORD_CHARS = '23456789bcdfghjkmpqrstvwxyBCDFGHJKMPQRSTVWXY!*?'.split('');

export class SessionEnrolment {
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
    version = AlgorithmEngineVersion.V3,
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
    const chars = Array.from(INVIGILATOR_PASSWORD_CHARS);
    for (let i = INVIGILATOR_PASSWORD_LENGTH; i >= 0; i--) {
      const j = Math.floor(Math.random() * (chars.length - 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.slice(0, INVIGILATOR_PASSWORD_LENGTH).join('');
  }

  isSessionScheduledInThePast() {
    const sessionDate = new Date(`${this.date}T${this.time}`);
    return sessionDate < new Date();
  }

  isCandidateAlreadyEnrolled({ candidates, candidatePersonalInfo, normalizeStringFnc }) {
    return this.findCandidatesByPersonalInfo({ candidates, candidatePersonalInfo, normalizeStringFnc }).length > 0;
  }

  /**
   * @param {object} params
   * @param {Array<Candidate>} params.candidates
   */
  hasReconciledCandidate({ candidates }) {
    return candidates.some((candidate) => candidate.isReconciled());
  }

  /**
   * @param {object} params
   * @param {Array<Candidate>} params.candidates
   * @param {number} params.userId
   */
  hasReconciledCandidateTo({ candidates, userId }) {
    return candidates.some((candidate) => candidate.isReconciledTo(userId));
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

  findCandidatesByPersonalInfo({
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
        normalizedInputNames.lastName === enrolledCandidatesNormalizedNames.lastName &&
        normalizedInputNames.firstName === enrolledCandidatesNormalizedNames.firstName &&
        birthdate === enrolledCandidate.birthdate
      );
    });
  }
}
