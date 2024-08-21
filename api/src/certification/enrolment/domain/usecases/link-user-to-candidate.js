/**
 * @typedef {import ('./index.js').CandidateRepository} CandidateRepository
 * @typedef {import ('./index.js').CenterRepository} CenterRepository
 * @typedef {import ('./index.js').OrganizationLearnerRepository} OrganizationLearnerRepository
 * @typedef {import ('./index.js').SessionRepository} SessionRepository
 * @typedef {import ('./index.js').UserRepository} UserRepository
 */

import {
  CertificationCandidateByPersonalInfoNotFoundError,
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  LanguageNotSupportedError,
  MatchingReconciledStudentNotFoundError,
  NotFoundError,
  UnexpectedUserAccountError,
  UserAlreadyLinkedToCandidateInSessionError,
} from '../../../../shared/domain/errors.js';
import * as languageService from '../../../../shared/domain/services/language-service.js';
import { CertificationCourse } from '../../../shared/domain/models/CertificationCourse.js';
import { CertificationVersion } from '../../../shared/domain/models/CertificationVersion.js';

/**
 * @param {Object} params
 * @param {CandidateRepository} params.candidateRepository
 * @param {CenterRepository} params.centerRepository
 * @param {OrganizationLearnerRepository} params.organizationLearnerRepository
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
  organizationLearnerRepository,
  sessionRepository,
  userRepository,
  normalizeStringFnc,
}) {
  const session = await sessionRepository.get({ id: sessionId });
  const center = await centerRepository.getById({ id: session.certificationCenterId });

  await validateUserLanguage({
    languageService,
    userRepository,
    userId,
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

  if (center.isMatchingOrganizationScoAndManagingStudents) {
    await checkCandidateMatchTheReconciledStudent({
      userId,
      enrolledCandidate,
      organizationLearnerRepository,
    });
  }

  enrolledCandidate.link(userId);
  await candidateRepository.update(enrolledCandidate);
  return { linkAlreadyDone: false, candidateId: enrolledCandidate.id };
}

async function validateUserLanguage({ languageService, userRepository, userId, session }) {
  if (CertificationVersion.isV3(session.version)) {
    const user = await userRepository.get({ id: userId });
    if (!user) {
      throw new NotFoundError(`User with id ${userId} does not exist.`);
    }
    const isUserLanguageValid = CertificationCourse.isLanguageAvailableForV3Certification(languageService, user.lang);

    if (!isUserLanguageValid) {
      throw new LanguageNotSupportedError(user.lang);
    }
  }
}

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

async function checkCandidateMatchTheReconciledStudent({ userId, enrolledCandidate, organizationLearnerRepository }) {
  const isOrganizationLearnerIdLinkedToUserAndSCOOrganization =
    await organizationLearnerRepository.isOrganizationLearnerIdLinkedToUserAndSCOOrganization({
      userId,
      organizationLearnerId: enrolledCandidate.organizationLearnerId,
    });

  if (!isOrganizationLearnerIdLinkedToUserAndSCOOrganization) {
    throw new MatchingReconciledStudentNotFoundError();
  }
}
