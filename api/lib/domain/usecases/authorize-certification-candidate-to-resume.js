export default async function authorizeCertificationCandidateToResume({
  certificationCandidateId,
  certificationCandidateForSupervisingRepository,
}) {
  const candidate = await certificationCandidateForSupervisingRepository.get(certificationCandidateId);
  candidate.authorizeToStart();

  await certificationCandidateForSupervisingRepository.update(candidate);
}
