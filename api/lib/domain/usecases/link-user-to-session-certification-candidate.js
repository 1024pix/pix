const _ = require('lodash');
const {
  CertificationCandidateAlreadyLinkedToUserError,
  CertificationCandidateByPersonalInfoNotFoundError,
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  CertificationCandidatePersonalInfoFieldMissingError,
  UserAlreadyLinkedToCandidateInSessionError,
} = require('../errors');

module.exports = async function linkUserToSessionCertificationCandidate({
  userId,
  sessionId,
  firstName,
  lastName,
  birthdate,
  certificationCandidateRepository,
}) {
  if (!_.every([sessionId, firstName, lastName, birthdate])) {
    throw new CertificationCandidatePersonalInfoFieldMissingError('One of mandatory personal info field is missing.');
  }

  const certificationCandidate = await _getSessionCertificationCandidateByPersonalInfo(arguments[0]);

  if (_.isNil(certificationCandidate.userId)) {
    const linkedCertificationCandidate = await _linkUserToCandidate({ sessionId, userId, certificationCandidate, certificationCandidateRepository });
    return {
      linkCreated: true,
      certificationCandidate: linkedCertificationCandidate,
    };
  }

  if (certificationCandidate.userId === userId) {
    return {
      linkCreated: false,
      certificationCandidate,
    };
  }

  throw new CertificationCandidateAlreadyLinkedToUserError('A user has already been linked to the certification candidate');
};

async function _getSessionCertificationCandidateByPersonalInfo({
  sessionId,
  firstName,
  lastName,
  birthdate,
  certificationCandidateRepository,
}) {
  const matchingSessionCandidates = await certificationCandidateRepository.findBySessionIdAndPersonalInfo({
    sessionId,
    firstName,
    lastName,
    birthdate,
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
  const existingCandidateLinkedToUser = await certificationCandidateRepository.findOneBySessionIdAndUserId({ sessionId, userId });
  if (existingCandidateLinkedToUser) {
    throw new UserAlreadyLinkedToCandidateInSessionError('The user is already linked to a candidate in the given session');
  }

  certificationCandidate.userId = userId;
  return certificationCandidateRepository.save(certificationCandidate);
}
