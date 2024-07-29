import bluebird from 'bluebird';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CertificationCandidateAlreadyLinkedToUserError } from '../../../../shared/domain/errors.js';

const importCertificationCandidatesFromCandidatesImportSheet = async function ({
  sessionId,
  odsBuffer,
  i18n,
  certificationCandidateRepository,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
  complementaryCertificationRepository,
  certificationCenterRepository,
  sessionRepository,
  certificationCandidatesOdsService,
  certificationCpfService,
}) {
  const linkedCandidateInSessionExists =
    await certificationCandidateRepository.doesLinkedCertificationCandidateInSessionExist({ sessionId });

  if (linkedCandidateInSessionExists) {
    throw new CertificationCandidateAlreadyLinkedToUserError('At least one candidate is already linked to a user');
  }

  const isSco = await sessionRepository.isSco({ id: sessionId });

  const certificationCandidates =
    await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
      i18n,
      sessionId,
      isSco,
      odsBuffer,
      certificationCpfService,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
      complementaryCertificationRepository,
      certificationCenterRepository,
    });

  await DomainTransaction.execute(async () => {
    await certificationCandidateRepository.deleteBySessionId({ sessionId });
    await bluebird.mapSeries(certificationCandidates, function (certificationCandidate) {
      return certificationCandidateRepository.saveInSession({
        certificationCandidate,
        sessionId,
      });
    });
  });
};

export { importCertificationCandidatesFromCandidatesImportSheet };
