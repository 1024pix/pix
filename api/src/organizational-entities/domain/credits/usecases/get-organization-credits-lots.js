/**
 * @typedef {import ('../../usecases/index.js').CreditsLotRepository} CreditsLotRepository
 */

import { STATUSES } from '../read-models/OrganizationCreditsLot.js';

const STATUS_DISPLAY_ORDER = [STATUSES.ACTIVE, STATUSES.PENDING, STATUSES.EXPIRED];

/**
 * Retrieves the credits lots of an organization with their consumptions,
 * active lots first and expired lots last.
 * @param {Object} params
 * @param {number} params.organizationId
 * @param {CreditsLotRepository} params.creditsLotRepository
 * @returns {Promise<Array<import('../read-models/OrganizationCreditsLot.js').OrganizationCreditsLot>>}
 */
const getOrganizationCreditsLots = async function ({ organizationId, creditsLotRepository }) {
  const creditsLots = await creditsLotRepository.findAllWithConsumptionsByOrganizationId({ organizationId });

  return creditsLots.toSorted(
    (a, b) => STATUS_DISPLAY_ORDER.indexOf(a.status) - STATUS_DISPLAY_ORDER.indexOf(b.status),
  );
};

export { getOrganizationCreditsLots };
