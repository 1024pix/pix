const { CertificationCandidateAlreadyLinkedToUserError } = require('../../domain/errors');
const bluebird = require('bluebird');

module.exports = async function importCertificationCandidatesFromCandidatesImportSheet({
  sessionId,
  odsBuffer,
  certificationCandidatesOdsService,
  certificationCandidateRepository,
  certificationCpfService,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
  complementaryCertificationRepository,
}) {
  const linkedCandidateInSessionExists =
    await certificationCandidateRepository.doesLinkedCertificationCandidateInSessionExist({ sessionId });

  if (linkedCandidateInSessionExists) {
    throw new CertificationCandidateAlreadyLinkedToUserError('At least one candidate is already linked to a user');
  }

  const certificationCandidates =
    await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
      sessionId,
      odsBuffer,
      certificationCpfService,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
      complementaryCertificationRepository,
    });

  await certificationCandidateRepository.deleteBySessionId({ sessionId });
  await bluebird.mapSeries(certificationCandidates, function (certificationCandidate) {
    return certificationCandidateRepository.saveInSession({
      certificationCandidate,
      complementaryCertifications: certificationCandidate.complementaryCertifications,
      sessionId,
    });
  });
};
