/**
 * @typedef {import ('./index.js').ScoBlockedAccessDatesRepository} ScoBlockedAccessDatesRepository
 */

/**
 * @param {object} params
 * @param {ScoBlockedAccessDatesRepository} paramsScoBlockedAccessDatesRepository
 * @returns {Promise<Array<ScoBlockedAccessDate>>}
 */
export async function getScoBlockedAccessDates({ ScoBlockedAccessDatesRepository }) {
  return ScoBlockedAccessDatesRepository.getScoBlockedAccessDates();
}
