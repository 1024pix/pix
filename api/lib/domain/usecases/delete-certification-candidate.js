const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function deleteCertificationCandidate({ userId, certificationCandidateId, certificationCandidateRepository }) {

  try {
    await certificationCandidateRepository.checkIfUserCertificationCenterMembershipHasAccessToCertificationCandidate(certificationCandidateId, userId);
  } catch (error) {
    throw new UserNotAuthorizedToAccessEntity('User does not have access to this certification candidate');
  }

  try {
    await certificationCandidateRepository.checkIfCertificationCandidateIsSafeForDeletion(certificationCandidateId);
  } catch (error) {
    throw error;
  }

  return certificationCandidateRepository.delete(certificationCandidateId);
};
