/**
 * @typedef {import ('../../domain/usecases/index.js').CenterRepository} CenterRepository
 */

import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { InvalidScoWhitelistError } from '../errors.js';

const INDEX_SHIFT_AND_CSV_HEADER = 2;

export const importScoWhitelist = withTransaction(
  /**
   * @param {object} params
   * @param {CenterRepository} params.centerRepository
   */
  async ({ externalIds = [], centerRepository }) => {
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

function _getCSVLineNumbersWithError({ externalIds, updatedExternalIds }) {
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
}
