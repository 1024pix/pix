// @ts-check
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CertificationCpfCity } from '../../../shared/domain/models/CertificationCpfCity.js';

const COLUMNS = ['id', 'name', 'postalCode', 'INSEECode', 'isActualName'];

/**
 * @function
 * @param {object} params
 * @param {number} params.INSEECode
 * @returns {Promise<Array<CertificationCpfCity>> }
 */
const findByINSEECode = async function ({ INSEECode }) {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn
    .select(COLUMNS)
    .from('certification-cpf-cities')
    .where({ INSEECode })
    .orderBy('isActualName', 'desc')
    .orderBy('id');

  return result.map((city) => new CertificationCpfCity(city));
};

/**
 * @function
 * @param {object} params
 * @param {number} params.postalCode
 * @returns {Promise<Array<CertificationCpfCity>> }
 */
const findByPostalCode = async function ({ postalCode }) {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn
    .select(COLUMNS)
    .from('certification-cpf-cities')
    .where({ postalCode })
    .orderBy('isActualName', 'desc')
    .orderBy('id');

  return result.map((city) => new CertificationCpfCity(city));
};

export { findByINSEECode, findByPostalCode };
