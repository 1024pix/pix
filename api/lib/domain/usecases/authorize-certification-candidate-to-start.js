export default async function authorizeCertificationCandidateToStart({
  certificationCandidateForSupervisingId,
  authorizedToStart,
  certificationCandidateForSupervisingRepository,
}) {
  await certificationCandidateForSupervisingRepository.update({
    id: certificationCandidateForSupervisingId,
    authorizedToStart,
  });
}
