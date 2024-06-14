const authorizeCertificationCandidateToResume = async function ({
  certificationCandidateId,
  certificationCandidateForSupervisingRepository,
}) {
  return certificationCandidateForSupervisingRepository.authorizeToStart({
    certificationCandidateId,
    authorizedToStart: true,
  });
};

export { authorizeCertificationCandidateToResume };
