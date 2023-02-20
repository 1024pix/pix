import _ from 'lodash';
import CertificationCandidate from '../models/CertificationCandidate';

import {
  CertificationCandidateAlreadyLinkedToUserError,
  CertificationCandidateByPersonalInfoNotFoundError,
  MatchingReconciledStudentNotFoundError,
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  UserAlreadyLinkedToCandidateInSessionError,
  SessionNotAccessible,
} from '../errors';

import UserLinkedToCertificationCandidate from '../events/UserLinkedToCertificationCandidate';
import UserAlreadyLinkedToCertificationCandidate from '../events/UserAlreadyLinkedToCertificationCandidate';

async function linkUserToSessionCertificationCandidate({
  userId,
  sessionId,
  firstName,
  lastName,
  birthdate,
  certificationCandidateRepository,
  certificationCenterRepository,
  organizationRepository,
  organizationLearnerRepository,
  sessionRepository,
}) {
  const session = await sessionRepository.get(sessionId);
  if (!session.isAccessible()) {
    throw new SessionNotAccessible();
  }
  const participatingCertificationCandidate = new CertificationCandidate({
    firstName,
    lastName,
    birthdate,
    sessionId,
  });
  participatingCertificationCandidate.validateParticipation();

  const certificationCandidate = await _getSessionCertificationCandidateByPersonalInfo({
    sessionId,
    participatingCertificationCandidate,
    certificationCandidateRepository,
  });

  const isSessionFromAScoAndManagingStudentsOrganization = await _isSessionFromAScoAndManagingStudentsOrganization({
    sessionId,
    certificationCenterRepository,
    organizationRepository,
  });

  if (!certificationCandidate.isLinkedToAUser()) {
    if (isSessionFromAScoAndManagingStudentsOrganization) {
      await _checkCandidateMatchTheReconciledStudent({
        userId,
        certificationCandidate,
        organizationLearnerRepository,
      });
    }
    await _linkUserToCandidate({
      sessionId,
      userId,
      certificationCandidate,
      certificationCandidateRepository,
    });
    return new UserLinkedToCertificationCandidate();
  }

  if (certificationCandidate.isLinkedToUserId(userId)) {
    return new UserAlreadyLinkedToCertificationCandidate();
  } else {
    throw new CertificationCandidateAlreadyLinkedToUserError();
  }
}

async function _getSessionCertificationCandidateByPersonalInfo({
  sessionId,
  participatingCertificationCandidate,
  certificationCandidateRepository,
}) {
  const matchingSessionCandidates = await certificationCandidateRepository.findBySessionIdAndPersonalInfo({
    sessionId,
    firstName: participatingCertificationCandidate.firstName,
    lastName: participatingCertificationCandidate.lastName,
    birthdate: participatingCertificationCandidate.birthdate,
  });
  if (_.isEmpty(matchingSessionCandidates)) {
    throw new CertificationCandidateByPersonalInfoNotFoundError(
      'No certification candidate matches with the provided personal info'
    );
  }
  if (matchingSessionCandidates.length > 1) {
    throw new CertificationCandidateByPersonalInfoTooManyMatchesError(
      'More than one candidate match with the provided personal info'
    );
  }

  return _.first(matchingSessionCandidates);
}

async function _isSessionFromAScoAndManagingStudentsOrganization({
  sessionId,
  certificationCenterRepository,
  organizationRepository,
}) {
  const sessionCertificationCenter = await certificationCenterRepository.getBySessionId(sessionId);

  if (sessionCertificationCenter.isSco) {
    const sessionOrganization = await _getOrganizationLinkedToCertificationCenter({
      certificationCenter: sessionCertificationCenter,
      organizationRepository,
    });
    return sessionOrganization.isScoAndManagingStudents;
  } else {
    return false;
  }
}

function _getOrganizationLinkedToCertificationCenter({ certificationCenter, organizationRepository }) {
  const commonExternalId = certificationCenter.externalId;
  return organizationRepository.getScoOrganizationByExternalId(commonExternalId);
}

async function _linkUserToCandidate({ sessionId, userId, certificationCandidate, certificationCandidateRepository }) {
  const existingCandidateLinkedToUser = await certificationCandidateRepository.findOneBySessionIdAndUserId({
    sessionId,
    userId,
  });
  if (existingCandidateLinkedToUser) {
    throw new UserAlreadyLinkedToCandidateInSessionError(
      'The user is already linked to a candidate in the given session'
    );
  }

  certificationCandidate.userId = userId;
  await certificationCandidateRepository.linkToUser({
    id: certificationCandidate.id,
    userId: certificationCandidate.userId,
  });
  return certificationCandidate;
}

async function _checkCandidateMatchTheReconciledStudent({
  userId,
  certificationCandidate,
  organizationLearnerRepository,
}) {
  const isOrganizationLearnerIdLinkedToUserAndSCOOrganization =
    await organizationLearnerRepository.isOrganizationLearnerIdLinkedToUserAndSCOOrganization({
      userId,
      organizationLearnerId: certificationCandidate.organizationLearnerId,
    });

  if (!isOrganizationLearnerIdLinkedToUserAndSCOOrganization) {
    throw new MatchingReconciledStudentNotFoundError();
  }
}

export default {
  linkUserToSessionCertificationCandidate,
};
