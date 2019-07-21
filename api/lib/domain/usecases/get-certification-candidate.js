const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function getCertificationCandidate({ userId, certificationCandidateId, certificationCandidateRepository }) {

  const hasAccess = await certificationCandidateRepository.checkIfUserCertificationCenterMembershipHasAccessToCertificationCandidate(certificationCandidateId, userId);

  if (!hasAccess) {
    throw new UserNotAuthorizedToAccessEntity('User does not have access to this certification candidate');
  }

  return certificationCandidateRepository.get(certificationCandidateId);
};
