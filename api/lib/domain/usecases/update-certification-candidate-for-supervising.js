module.exports = async function updateCertificationCandidateForSupervising({
  certificationCandidateForSupervisingId,
  authorizedToStart,
  certificationCandidateForSupervisingRepository,
}) {
  await certificationCandidateForSupervisingRepository.update({
    id: certificationCandidateForSupervisingId,
    authorizedToStart,
  });
};
