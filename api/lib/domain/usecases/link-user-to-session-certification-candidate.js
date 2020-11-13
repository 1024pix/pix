const _ = require('lodash');
const CertificationCandidate = require('../models/CertificationCandidate');
const {
  CertificationCandidateAlreadyLinkedToUserError,
  CertificationCandidateByPersonalInfoNotFoundError,
  MatchingReconciledStudentNotFoundError,
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  UserAlreadyLinkedToCandidateInSessionError,
} = require('../errors');
const UserLinkedToCertificationCandidate = require('../events/UserLinkedToCertificationCandidate');
const UserAlreadyLinkedToCertificationCandidate = require('../events/UserAlreadyLinkedToCertificationCandidate');

async function linkUserToSessionCertificationCandidate({
  userId,
  sessionId,
  firstName,
  lastName,
  birthdate,
  certificationCandidateRepository,
  sessionRepository,
  schoolingRegistrationRepository,
}) {
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

  const isSco = await sessionRepository.isSco(sessionId);

  if (!certificationCandidate.isLinkedToAUser()) {
    if (isSco) {
      await _checkCandidateMatchTheReconciledStudent({
        userId,
        certificationCandidate,
        schoolingRegistrationRepository,
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
    throw new CertificationCandidateByPersonalInfoNotFoundError('No certification candidate matches with the provided personal info');
  }
  if (matchingSessionCandidates.length > 1) {
    throw new CertificationCandidateByPersonalInfoTooManyMatchesError('More than one candidate match with the provided personal info');
  }

  return _.first(matchingSessionCandidates);
}

async function _linkUserToCandidate({
  sessionId,
  userId,
  certificationCandidate,
  certificationCandidateRepository,
}) {
  const existingCandidateLinkedToUser = await certificationCandidateRepository.findOneBySessionIdAndUserId({
    sessionId,
    userId,
  });
  if (existingCandidateLinkedToUser) {
    throw new UserAlreadyLinkedToCandidateInSessionError('The user is already linked to a candidate in the given session');
  }

  certificationCandidate.userId = userId;
  await certificationCandidateRepository.linkToUser({
    id: certificationCandidate.id,
    userId: certificationCandidate.userId,
  });
  return certificationCandidate;
}

async function _checkCandidateMatchTheReconciledStudent({ userId, certificationCandidate, schoolingRegistrationRepository }) {
  const isSchoolingRegistrationIdLinkedToUserAndSCOOrganization = await schoolingRegistrationRepository.isSchoolingRegistrationIdLinkedToUserAndSCOOrganization({
    userId,
    schoolingRegistrationId: certificationCandidate.schoolingRegistrationId,
  });
  if (!isSchoolingRegistrationIdLinkedToUserAndSCOOrganization) {
    throw new MatchingReconciledStudentNotFoundError();
  }
}

module.exports = {
  linkUserToSessionCertificationCandidate,
};
