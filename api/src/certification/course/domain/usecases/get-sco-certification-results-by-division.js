/**
 * @typedef {import ('./index.js').CertificationResultRepository} CertificationResultRepository
 * @typedef {import ('./index.js').ScoCertificationCandidateRepository} ScoCertificationCandidateRepository
 */
import lodash from 'lodash';

const { isEmpty } = lodash;

import { NoCertificationResultForDivision } from '../../../../../lib/domain/errors.js';

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
  if (isEmpty(candidateIds)) {
    throw new NoCertificationResultForDivision();
  }

  const certificationResults = await certificationResultRepository.findByCertificationCandidateIds({
    certificationCandidateIds: candidateIds,
  });
  if (isEmpty(certificationResults)) {
    throw new NoCertificationResultForDivision();
  }

  return certificationResults;
};

export { getScoCertificationResultsByDivision };
