/**
 * @typedef {import ('../../domain/models/Candidate.js').Candidate} Candidate
 */
import { NotFoundError, UserNotAuthorizedToCertifyError } from '../../../../shared/domain/errors.js';
import {
  CertificationCandidateByPersonalInfoNotFoundError,
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  MatchingReconciledStudentNotFoundError,
  UserAlreadyLinkedToCandidateInSessionError,
} from '../../../../shared/domain/errors.js';
import { CenterHabilitationError } from '../../../shared/domain/errors.js';
import { SessionExpiredError } from '../errors.js';

/**
 * Candidate entry to a certification is a multi step process
 * @param {object} params
 * @param {number} params.userId
 * @param {number} params.sessionId
 * @param {string} params.firstName
 * @param {string} params.lastName
 * @param {Date} params.birthdate
 * @param {Function} params.normalizeStringFnc
 * @returns {Promise<Candidate>}
 */
export async function registerCandidateParticipation({
  userId,
  sessionId,
  firstName,
  lastName,
  birthdate,
  normalizeStringFnc,
  candidateRepository,
  centerRepository,
  sessionRepository,
  userRepository,
  placementProfileService,
  eventAdapter,
  sessionAuthorizationAdapter,
}) {
  const sessionAuthorization = await sessionAuthorizationAdapter.find({ sessionId });

  if (!sessionAuthorization) {
    throw new NotFoundError(`Session ${sessionId} does not exist`);
  }

  if (!sessionAuthorization.canJoinSession) {
    throw new SessionExpiredError();
  }

  const session = await sessionRepository.get({ id: sessionId });

  const candidate = await checkAndGetCandidateFromSession({
    userId,
    firstName,
    lastName,
    birthdate,
    session,
    normalizeStringFnc,
  });
  if (candidate.isReconciledTo(userId)) {
    return candidate;
  }

  if (session.hasReconciledCandidateTo({ userId })) {
    throw new UserAlreadyLinkedToCandidateInSessionError(
      'The user is already linked to a candidate with different personal info in the given session',
      'USER_ALREADY_LINKED_TO_CANDIDATE_IN_SESSION',
    );
  }

  await checkAroundCertificationCenter({
    centerRepository,
    userRepository,
    session,
    candidate,
    userId,
  });

  await checkIfUserIsCertifiable({ placementProfileService, userId });

  candidate.reconcile(userId);
  await candidateRepository.update(candidate);
  await eventAdapter.onCandidateReconciled({ candidate });
  return candidate;
}

async function checkAndGetCandidateFromSession({
  userId,
  firstName,
  lastName,
  birthdate,
  session,
  normalizeStringFnc,
}) {
  const candidate = findMatchingEnrolledCandidate({
    session,
    firstName,
    lastName,
    birthdate,
    normalizeStringFnc,
  });

  if (candidate.userId && candidate.userId !== userId) {
    throw new UserAlreadyLinkedToCandidateInSessionError();
  }

  return candidate;
}

/**
 * @param {object} params
 * @param {string} params.firstName
 * @param {string} params.lastName
 * @param {Date} params.birthdate
 * @param {Function} params.normalizeStringFnc
 */
function findMatchingEnrolledCandidate({ session, firstName, lastName, birthdate, normalizeStringFnc }) {
  const matchingEnrolledCandidates = session.findCandidatesByPersonalInfo({
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

async function checkAroundCertificationCenter({ centerRepository, userRepository, session, candidate, userId }) {
  const center = await centerRepository.getById({ id: session.certificationCenterId });
  if (!candidate.hasCoreFrameworkSubscription() && !center.isHabilitated(candidate.subscription)) {
    throw new CenterHabilitationError({
      meta: { framework: candidate.subscription },
    });
  }

  const user = await userRepository.get({ id: userId });

  if (center.isMatchingOrganizationScoAndManagingStudents) {
    if (!user.has({ organizationLearnerId: candidate.organizationLearnerId })) {
      throw new MatchingReconciledStudentNotFoundError();
    }
  }
}

async function checkIfUserIsCertifiable({ placementProfileService, userId }) {
  const placementProfile = await placementProfileService.getPlacementProfile({
    userId,
    limitDate: new Date(),
  });

  if (!placementProfile.isCertifiable()) {
    throw new UserNotAuthorizedToCertifyError();
  }
}
