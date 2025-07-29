/**
 * @typedef {import ('./index.js').CandidateRepository} CandidateRepository
 * @typedef {import ('./index.js').CenterRepository} CenterRepository
 * @typedef {import ('./index.js').SessionRepository} SessionRepository
 * @typedef {import ('./index.js').UserRepository} UserRepository
 * @typedef {import ('../models/Candidate.js').Candidate} Candidate
 */

import {
  CertificationCandidateByPersonalInfoNotFoundError,
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  LanguageNotSupportedError,
  MatchingReconciledStudentNotFoundError,
  UnexpectedUserAccountError,
  UserAlreadyLinkedToCandidateInSessionError,
} from '../../../../shared/domain/errors.js';
import { CertificationCourse } from '../../../shared/domain/models/CertificationCourse.js';

/**
 * @param {Object} params
 * @param {CandidateRepository} params.candidateRepository
 * @param {CenterRepository} params.centerRepository
 * @param {SessionRepository} params.sessionRepository
 * @param {UserRepository} params.userRepository
 * @returns {Promise<Candidate>}
 */
export const verifyCandidateIdentity = async ({
  userId,
  sessionId,
  firstName,
  lastName,
  birthdate,
  candidateRepository,
  centerRepository,
  sessionRepository,
  userRepository,
  normalizeStringFnc,
}) => {
  const user = await userRepository.get({ id: userId });

  const isUserLanguageValid = CertificationCourse.isLanguageAvailableForV3Certification(user.lang);
  if (!isUserLanguageValid) {
    throw new LanguageNotSupportedError(user.lang);
  }

  const session = await sessionRepository.get({ id: sessionId });

  const candidatesInSession = await candidateRepository.findBySessionId({ sessionId: session.id });

  const candidate = findMatchingEnrolledCandidate({
    session,
    candidatesInSession,
    firstName,
    lastName,
    birthdate,
    normalizeStringFnc,
  });

  if (candidate.isReconciled()) {
    if (candidate.isReconciledTo(userId)) {
      return candidate;
    }
    throw new UnexpectedUserAccountError({});
  }

  if (session.hasReconciledCandidateTo({ candidates: candidatesInSession, userId })) {
    throw new UserAlreadyLinkedToCandidateInSessionError(
      'The user is already linked to a candidate with different personal info in the given session',
    );
  }

  const center = await centerRepository.getById({ id: session.certificationCenterId });

  if (center.isMatchingOrganizationScoAndManagingStudents) {
    if (!user.has({ organizationLearnerId: candidate.organizationLearnerId })) {
      throw new MatchingReconciledStudentNotFoundError();
    }
  }

  return candidate;
};

/**
 * @param {Object} params
 * @param {Array<Candidate>} params.candidatesInSession
 */
function findMatchingEnrolledCandidate({
  session,
  candidatesInSession,
  firstName,
  lastName,
  birthdate,
  normalizeStringFnc,
}) {
  const matchingEnrolledCandidates = session.findCandidatesByPersonalInfo({
    candidates: candidatesInSession,
    candidatePersonalInfo: {
      firstName,
      lastName,
      birthdate,
    },
    normalizeStringFnc,
  });
  if (matchingEnrolledCandidates.length === 0) {
    throw new CertificationCandidateByPersonalInfoNotFoundError(
      'No certification candidate matches with the provided personal info',
    );
  }
  if (matchingEnrolledCandidates.length > 1) {
    throw new CertificationCandidateByPersonalInfoTooManyMatchesError(
      'More than one candidate match with the provided personal info',
    );
  }
  return matchingEnrolledCandidates[0];
}
