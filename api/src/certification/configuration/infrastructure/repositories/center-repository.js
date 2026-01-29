// @ts-check
import { knex } from '../../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { Center } from '../../domain/models/Center.js';
import { CenterTypes } from '../../domain/models/CenterTypes.js';

/**
 * @param {object} params
 * @param {Array<string>} params.externalIds
 * @returns {Promise<Array<number>>} - number of rows affected
 */
export const addToWhitelistByExternalIds = async ({ externalIds }) => {
  const knexConn = DomainTransaction.getConnection();
  const updatedLines = await knexConn('certification-centers')
    .update({
      isScoBlockedAccessWhitelist: true,
      updatedAt: knex.fn.now(),
    })
    .where({
      type: CenterTypes.SCO,
      archivedAt: null,
    })
    .whereIn('externalId', externalIds)
    .returning('externalId');

  const updatedExternalIds = updatedLines.map((line) => line.externalId);
  return updatedExternalIds;
};

/**
 * @returns {Promise<number>}
 */
export const resetWhitelist = async () => {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('certification-centers')
    .update({ isScoBlockedAccessWhitelist: false, updatedAt: knex.fn.now() })
    .where({ type: CenterTypes.SCO });
};

/**
 * @returns {Promise<Array<Center>>}
 */
export const getWhitelist = async () => {
  const knexConn = DomainTransaction.getConnection();
  const data = await knexConn('certification-centers')
    .select('id', 'type', 'externalId')
    .where({ isScoBlockedAccessWhitelist: true });

  return data.map(_toDomain);
};

/**
 * @param {object} data
 * @param {number} data.id
 * @param {string} data.externalId
 * @param {CenterTypes} data.type
 * @returns {Center}
 */
const _toDomain = ({ id, externalId, type }) => {
  return new Center({ id, externalId, type });
};
