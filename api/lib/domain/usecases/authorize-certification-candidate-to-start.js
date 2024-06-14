const authorizeCertificationCandidateToStart = async function ({
  certificationCandidateForSupervisingId,
  authorizedToStart,
  certificationCandidateForSupervisingRepository,
}) {
  return certificationCandidateForSupervisingRepository.authorizeToStart({
    certificationCandidateId: certificationCandidateForSupervisingId,
    authorizedToStart,
  });
};

export { authorizeCertificationCandidateToStart };
