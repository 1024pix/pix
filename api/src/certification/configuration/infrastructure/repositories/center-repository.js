// @ts-check
import { CERTIFICATION_CENTER_TYPES } from '../../../../shared/constants.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { Center } from '../../domain/models/Center.js';

/**
 * @param {object} params
 * @param {Array<string>} params.externalIds
 * @returns {Promise<Array<string>>} - externalIds of rows affected
 */
export async function addToWhitelistByExternalIds({ externalIds }) {
  const knexConn = DomainTransaction.getConnection();
  const updatedLines = await knexConn('certification-centers')
    .update({
      isScoBlockedAccessWhitelist: true,
      updatedAt: knexConn.fn.now(),
    })
    .where({
      type: CERTIFICATION_CENTER_TYPES.SCO,
      archivedAt: null,
    })
    .whereRaw('LOWER("externalId") = ANY(?)', [externalIds.map((id) => id.toLowerCase())])
    .returning('externalId');

  return updatedLines.map((line) => line.externalId);
}

/**
 * @returns {Promise<number>}
 */
export async function resetWhitelist() {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('certification-centers')
    .update({ isScoBlockedAccessWhitelist: false, updatedAt: knexConn.fn.now() })
    .where({ type: CERTIFICATION_CENTER_TYPES.SCO });
}

/**
 * @returns {Promise<Array<Center>>}
 */
export async function getWhitelist() {
  const knexConn = DomainTransaction.getConnection();
  const data = await knexConn('certification-centers')
    .select('id', 'type', 'externalId')
    .where({ isScoBlockedAccessWhitelist: true });

  return data.map(_toDomain);
}

/**
 * @param {object} data
 * @param {number} data.id
 * @param {string} data.externalId
 * @param {typeof CERTIFICATION_CENTER_TYPES} data.type
 * @returns {Center}
 */
function _toDomain({ id, externalId, type }) {
  return new Center({ id, externalId, type });
}
