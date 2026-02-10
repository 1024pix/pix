// @ts-check
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { AdministrationTeam } from '../../domain/models/AdministrationTeam.js';

/**
 * @function
 * @returns {Promise<Array<AdministrationTeam>>}
 */
const findAll = async function () {
  const knexConn = DomainTransaction.getConnection();
  const administrationTeams = await knexConn.select('id', 'name').from('administration_teams').orderBy('name', 'asc');

  return administrationTeams.map(_toDomain);
};

/**
 * @function
 * @param {number} id
 * @returns {Promise<AdministrationTeam | null>}
 */
const getById = async function (id) {
  const knexConn = DomainTransaction.getConnection();
  const administrationTeam = await knexConn.select('id', 'name').from('administration_teams').where({ id }).first();

  if (!administrationTeam) {
    return null;
  }

  return _toDomain(administrationTeam);
};

/**
 * @typedef {{
 *  id: number,
 *  name: string,
 * }} AdministrationTeamDTO
 */

/**
 * @function
 * @param {AdministrationTeamDTO} administrationTeamDTO
 * @returns {AdministrationTeam}
 */
const _toDomain = function (administrationTeamDTO) {
  return new AdministrationTeam({
    ...administrationTeamDTO,
  });
};

export { findAll, getById };
