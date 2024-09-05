import { CERTIFICATION_CENTER_TYPES } from '../../../../shared/domain/constants.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

/**
 * @param {Object} params
 * @param {number} params.batchSize
 */
export const fetchSCOV2Centers = async function () {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('certification-centers')
    .pluck('certification-centers.id')
    .where({ isV3Pilot: false, type: CERTIFICATION_CENTER_TYPES.SCO });
};
