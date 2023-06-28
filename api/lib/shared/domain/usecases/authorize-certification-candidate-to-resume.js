const authorizeCertificationCandidateToResume = async function ({
  certificationCandidateId,
  certificationCandidateForSupervisingRepository,
}) {
  const candidate = await certificationCandidateForSupervisingRepository.get(certificationCandidateId);
  candidate.authorizeToStart();

  await certificationCandidateForSupervisingRepository.update(candidate);
};

export { authorizeCertificationCandidateToResume };
