/**
 * @typedef {import ('../../domain/usecases/index.js').CenterRepository} CenterRepository
 */

import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';

export const importScoWhitelist = withTransaction(
  /**
   * @param {Object} params
   * @param {CenterRepository} params.centerRepository
   */
  async ({ externalIds = [], centerRepository }) => {
    await centerRepository.resetWhitelist();
    return centerRepository.addToWhitelistByExternalIds({ externalIds });
  },
);
