/**
 * @typedef {import ('../../domain/usecases/index.js').CertificationResultRepository} CertificationResultRepository
 * @typedef {import ('../../domain/usecases/index.js').ScoCertificationCandidateRepository} ScoCertificationCandidateRepository
 */

import * as injectedCertificationResultRepository from '../../infrastructure/repositories/certification-result-repository.js';
import * as injectedScoCertificationCandidateRepository from '../../infrastructure/repositories/sco-certification-candidate-repository.js';
import { NoCertificationResultForDivision } from '../errors.js';

/**
 * @param {Object} params
 * @param {CertificationResultRepository} params.certificationResultRepository
 * @param {ScoCertificationCandidateRepository} params.scoCertificationCandidateRepository
 */
const getScoCertificationResultsByDivision = async function ({
  organizationId,
  division,
  scoCertificationCandidateRepository = injectedScoCertificationCandidateRepository,
  certificationResultRepository = injectedCertificationResultRepository,
} = {}) {
  const candidateIds = await scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision({
    organizationId,
    division,
  });
  if (candidateIds?.length === 0) {
    throw new NoCertificationResultForDivision();
  }

  const certificationResults = await certificationResultRepository.findByCertificationCandidateIds({
    certificationCandidateIds: candidateIds,
  });
  if (certificationResults?.length === 0) {
    throw new NoCertificationResultForDivision();
  }

  return certificationResults;
};

export { getScoCertificationResultsByDivision };
