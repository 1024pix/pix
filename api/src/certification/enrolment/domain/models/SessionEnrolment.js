/**
 * @typedef {import('./Candidate.js').Candidate} Candidate
 */
import { CERTIFICATION_CENTER_TYPES } from '../../../../shared/constants.js';
import { SESSION_STATUSES } from '../../../shared/domain/constants.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';

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
    this.invigilatorPassword = invigilatorPassword;
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
