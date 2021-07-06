const { CertificationCandidateAlreadyLinkedToUserError } = require('../../domain/errors');

module.exports = async function importCertificationCandidatesFromCandidatesImportSheet({
  sessionId,
  odsBuffer,
  certificationCandidatesOdsService,
  certificationCandidateRepository,
  certificationCpfService,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
}) {
  const linkedCandidateInSessionExists = await certificationCandidateRepository.doesLinkedCertificationCandidateInSessionExist({ sessionId });

  if (linkedCandidateInSessionExists) {
    throw new CertificationCandidateAlreadyLinkedToUserError('At least one candidate is already linked to a user');
  }

  const certificationCandidates = await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
    sessionId,
    odsBuffer,
    certificationCpfService,
    certificationCpfCountryRepository,
    certificationCpfCityRepository,
  });

  return certificationCandidateRepository.setSessionCandidates(sessionId, certificationCandidates);
};
