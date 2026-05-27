/**
 * @typedef {import('./index.js').CandidateRepository} CandidateRepository
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CandidateAlreadyLinkedToUserError } from '../../../../shared/domain/errors.js';

/**
 * @param {object} params
 * @param {CandidateRepository} params.candidateRepository
 * @param {SessionRepository} params.sessionRepository
 */
const importCertificationCandidatesFromCandidatesImportSheet = async function ({
  sessionId,
  odsBuffer,
  i18n,
  candidateRepository,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
  centerRepository,
  sessionRepository,
  certificationCandidatesOdsService,
  certificationCpfService,
}) {
  const candidatesInSession = await candidateRepository.findBySessionId({ sessionId });
  const session = await sessionRepository.get({ id: sessionId });

  if (session.hasReconciledCandidate({ candidates: candidatesInSession })) {
    throw new CandidateAlreadyLinkedToUserError('At least one candidate is already linked to a user');
  }

  const candidates = await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
    i18n,
    session,
    isSco: session.isSco,
    odsBuffer,
    certificationCpfService,
    certificationCpfCountryRepository,
    certificationCpfCityRepository,
    centerRepository,
  });

  await DomainTransaction.execute(async () => {
    await candidateRepository.deleteBySessionId({ sessionId });
    await candidateRepository.save(candidates);
  });
};

export { importCertificationCandidatesFromCandidatesImportSheet };
