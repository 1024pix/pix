/**
 * @typedef {import ('../../domain/usecases/index.js').CertificationResultRepository} CertificationResultRepository
 * @typedef {import ('../../domain/usecases/index.js').ScoCertificationCandidateRepository} ScoCertificationCandidateRepository
 */

import { NoCertificationResultForDivision } from '../errors.js';

/**
 * @param {Object} params
 * @param {CertificationResultRepository} params.certificationResultRepository
 * @param {ScoCertificationCandidateRepository} params.scoCertificationCandidateRepository
 */
const getScoCertificationResultsByDivision = async function ({
  organizationId,
  division,
  scoCertificationCandidateRepository,
  certificationResultRepository,
}) {
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
