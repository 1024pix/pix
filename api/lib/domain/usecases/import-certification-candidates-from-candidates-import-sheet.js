const { CertificationCandidateAlreadyLinkedToUserError } = require('../../domain/errors.js');
const bluebird = require('bluebird');
const DomainTransaction = require('../../infrastructure/DomainTransaction.js');

module.exports = async function importCertificationCandidatesFromCandidatesImportSheet({
  sessionId,
  odsBuffer,
  certificationCandidatesOdsService,
  certificationCandidateRepository,
  certificationCpfService,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
  complementaryCertificationRepository,
  certificationCenterRepository,
  sessionRepository,
}) {
  const linkedCandidateInSessionExists =
    await certificationCandidateRepository.doesLinkedCertificationCandidateInSessionExist({ sessionId });

  if (linkedCandidateInSessionExists) {
    throw new CertificationCandidateAlreadyLinkedToUserError('At least one candidate is already linked to a user');
  }

  const isSco = await sessionRepository.isSco({ sessionId });

  const certificationCandidates =
    await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
      sessionId,
      isSco,
      odsBuffer,
      certificationCpfService,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
      complementaryCertificationRepository,
      certificationCenterRepository,
    });

  await DomainTransaction.execute(async (domainTransaction) => {
    await certificationCandidateRepository.deleteBySessionId({ sessionId, domainTransaction });
    await bluebird.mapSeries(certificationCandidates, function (certificationCandidate) {
      return certificationCandidateRepository.saveInSession({
        certificationCandidate,
        complementaryCertifications: certificationCandidate.complementaryCertifications,
        sessionId,
        domainTransaction,
      });
    });
  });
};
