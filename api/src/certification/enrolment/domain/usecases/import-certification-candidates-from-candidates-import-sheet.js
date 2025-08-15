/**
 * @typedef {import('./index.js').CandidateRepository} CandidateRepository
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CandidateAlreadyLinkedToUserError } from '../../../../shared/domain/errors.js';
import * as injectedCertificationCpfService from '../../../shared/domain/services/certification-cpf-service.js';
import * as injectedCandidateRepository from '../../infrastructure/repositories/candidate-repository.js';
import * as injectedCenterRepository from '../../infrastructure/repositories/center-repository.js';
import * as injectedCertificationCpfCityRepository from '../../infrastructure/repositories/certification-cpf-city-repository.js';
import * as injectedCertificationCpfCountryRepository from '../../infrastructure/repositories/certification-cpf-country-repository.js';
import * as injectedSessionRepository from '../../infrastructure/repositories/session-repository.js';
import * as injectedCertificationCandidatesOdsService from '../services/certification-candidates-ods-service.js';

/**
 * @param {Object} params
 * @param {CandidateRepository} params.candidateRepository
 * @param {SessionRepository} params.sessionRepository
 */
const importCertificationCandidatesFromCandidatesImportSheet = async function ({
  sessionId,
  odsBuffer,
  i18n,
  candidateRepository = injectedCandidateRepository,
  certificationCpfCountryRepository = injectedCertificationCpfCountryRepository,
  certificationCpfCityRepository = injectedCertificationCpfCityRepository,
  centerRepository = injectedCenterRepository,
  sessionRepository = injectedSessionRepository,
  certificationCandidatesOdsService = injectedCertificationCandidatesOdsService,
  certificationCpfService = injectedCertificationCpfService,
} = {}) {
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

    for (const candidate of candidates) {
      await candidateRepository.saveInSession({ candidate, sessionId });
    }
  });
};

export { importCertificationCandidatesFromCandidatesImportSheet };
