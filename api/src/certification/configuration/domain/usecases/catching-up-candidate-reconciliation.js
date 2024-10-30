/**
 * @typedef {import ('./index.js').CandidateRepository} CandidateRepository
 * @typedef {import ('../models/Candidate.js').Candidate} Candidate
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';

/**
 * @param {Object} params
 * @param {number} params.[chunkSize] - default 100000
 * @param {CandidateRepository} params.candidateRepository
 * @returns {Promise<void>}
 */
export const catchingUpCandidateReconciliation = async ({ chunkSize = 100000, candidateRepository }) => {
  logger.info(`Starting certification-candidates.reconciledAt updates by chunk of ${chunkSize}`);
  let migratedLines = 0;
  let hasNext = true;
  do {
    const candidates = await candidateRepository.findCandidateWithoutReconciledAt({ limit: chunkSize });
    logger.info(`Found ${candidates.length} certification-candidates without reconciledAt`);

    migratedLines += await performUpdates({ candidates, candidateRepository });
    logger.info(`Update committed for ${migratedLines} candidates`);
    hasNext = !!candidates.length;
  } while (hasNext);

  logger.info(`Total of ${migratedLines} certification-candidates.reconciledAt updated`);
};

/**
 * @param {Object} params
 * @param {Array<Candidate>} params.candidates
 * @param {CandidateRepository} params.candidateRepository
 */
const performUpdates = async ({ candidates = [], candidateRepository }) => {
  return DomainTransaction.execute(async () => {
    let migratedLines = 0;
    for (const candidate of candidates) {
      migratedLines += await candidateRepository.update({ candidate });
    }
    return migratedLines;
  });
};
