/**
 * @typedef {import ('../../domain/usecases/index.js').CenterRepository} CenterRepository
 */

import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import * as injectedCenterRepository from '../../infrastructure/repositories/center-repository.js';
import { InvalidScoWhitelistError } from '../errors.js';

const INDEX_SHIFT_AND_CSV_HEADER = 2;

export const importScoWhitelist = withTransaction(
  /**
   * @param {Object} params
   * @param {CenterRepository} params.centerRepository
   */
  async ({ externalIds = [], centerRepository = injectedCenterRepository } = {}) => {
    await centerRepository.resetWhitelist();
    const updatedExternalIds = await centerRepository.addToWhitelistByExternalIds({ externalIds });

    const csvLineNumbersWithError = _getCSVLineNumbersWithError({ externalIds, updatedExternalIds });

    if (csvLineNumbersWithError.length > 0) {
      throw new InvalidScoWhitelistError({
        lineNumbersWithError: csvLineNumbersWithError,
      });
    }
  },
);

const _getCSVLineNumbersWithError = ({ externalIds, updatedExternalIds }) => {
  const uniqueExternalIds = [...new Set(externalIds)];
  const externalIdsOnError = uniqueExternalIds.filter((externalId) => {
    return !updatedExternalIds.includes(externalId);
  });

  if (externalIdsOnError.length > 0) {
    const csvLineNumbersWithError = externalIdsOnError.flatMap((externalIdOnError) => {
      const idLineNumbersOccurences = [];

      externalIds.forEach((externalId, index) => {
        if (externalId === externalIdOnError) {
          idLineNumbersOccurences.push(index + INDEX_SHIFT_AND_CSV_HEADER);
        }
      });

      return idLineNumbersOccurences;
    });

    return csvLineNumbersWithError.sort();
  }

  return [];
};
