import bluebird from 'bluebird';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CandidateAlreadyLinkedToUserError } from '../../../../shared/domain/errors.js';

const importCertificationCandidatesFromCandidatesImportSheet = async function ({
  sessionId,
  odsBuffer,
  i18n,
  candidateRepository,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
  complementaryCertificationRepository,
  certificationCenterRepository,
  sessionRepository,
  certificationCandidatesOdsService,
  certificationCpfService,
}) {
  const linkedCandidateInSessionExists = await candidateRepository.doesLinkedCertificationCandidateInSessionExist({
    sessionId,
  });

  if (linkedCandidateInSessionExists) {
    throw new CandidateAlreadyLinkedToUserError('At least one candidate is already linked to a user');
  }

  const isSco = await sessionRepository.isSco({ id: sessionId });

  const candidates = await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
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
    await candidateRepository.deleteBySessionId({ sessionId });
    await bluebird.mapSeries(candidates, function (candidate) {
      return candidateRepository.saveInSession({
        candidate,
        sessionId,
      });
    });
  });
};

export { importCertificationCandidatesFromCandidatesImportSheet };
