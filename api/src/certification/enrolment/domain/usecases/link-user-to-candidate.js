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
  NotFoundError,
  UnexpectedUserAccountError,
  UserAlreadyLinkedToCandidateInSessionError,
  UserNotAuthorizedToCertifyError,
} from '../../../../shared/domain/errors.js';
import * as languageService from '../../../../shared/domain/services/language-service.js';
import { CertificationCourse } from '../../../shared/domain/models/CertificationCourse.js';
import { CertificationVersion } from '../../../shared/domain/models/CertificationVersion.js';

/**
 * @param {Object} params
 * @param {CandidateRepository} params.candidateRepository
 * @param {CenterRepository} params.centerRepository
 * @param {SessionRepository} params.sessionRepository
 * @param {UserRepository} params.userRepository
 */
export async function linkUserToCandidate({
  sessionId,
  userId,
  firstName,
  lastName,
  birthdate,
  candidateRepository,
  centerRepository,
  sessionRepository,
  userRepository,
  normalizeStringFnc,
}) {
  // step 1 : verify user
  const user = await userRepository.get({ id: userId });
  if (!user) {
    throw new NotFoundError(`User with id ${userId} does not exist.`);
  }

  const session = await sessionRepository.get({ id: sessionId });
  await validateUserLanguage({
    languageService,
    user,
    session,
  });

  const candidatesInSession = await candidateRepository.findBySessionId({ sessionId: session.id });
  const enrolledCandidate = findMatchingEnrolledCandidate({
    session,
    candidatesInSession,
    firstName,
    lastName,
    birthdate,
    normalizeStringFnc,
  });

  if (enrolledCandidate.isLinkedToAUser()) {
    if (enrolledCandidate.isLinkedTo(userId)) {
      return { linkAlreadyDone: true, candidateId: enrolledCandidate.id };
    }
    throw new UnexpectedUserAccountError({});
  }

  if (session.hasLinkedCandidateTo({ candidates: candidatesInSession, userId })) {
    throw new UserAlreadyLinkedToCandidateInSessionError(
      'The user is already linked to a candidate with different personal info in the given session',
    );
  }

  const center = await centerRepository.getById({ id: session.certificationCenterId });
  if (center.isMatchingOrganizationScoAndManagingStudents) {
    if (!user.has({ organizationLearnerId: enrolledCandidate.organizationLearnerId })) {
      throw new MatchingReconciledStudentNotFoundError();
    }
  }

  // step 2 : check subscriptions
  const hasCoreSubscription = enrolledCandidate.subscriptions.some((subscription) => subscription.isCore());
  if (hasCoreSubscription) {
    // check has minimum 5 comp niveau 1, if not throw
    throw new UserNotAuthorizedToCertifyError();
  }

  // step 3 : link
  enrolledCandidate.link(userId);
  await candidateRepository.update(enrolledCandidate);
  return { linkAlreadyDone: false, candidateId: enrolledCandidate.id };
}

async function validateUserLanguage({ languageService, user, session }) {
  if (CertificationVersion.isV3(session.version)) {
    const isUserLanguageValid = CertificationCourse.isLanguageAvailableForV3Certification(languageService, user.lang);

    if (!isUserLanguageValid) {
      throw new LanguageNotSupportedError(user.lang);
    }
  }
}

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
