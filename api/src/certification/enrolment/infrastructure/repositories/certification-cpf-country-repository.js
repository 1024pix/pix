// @ts-check
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CertificationCpfCountry } from '../../../shared/domain/models/CertificationCpfCountry.js';

/**
 * @function
 * @param {object} params
 * @param {string} params.matcher
 * @returns {Promise<CertificationCpfCountry | null> }
 */
const getByMatcher = async function ({ matcher }) {
  const knexConn = DomainTransaction.getConnection();
  const COLUMNS = ['id', 'code', 'commonName', 'originalName', 'matcher'];

  const result = await knexConn.select(COLUMNS).from('certification-cpf-countries').where({ matcher }).first();

  if (!result) {
    return null;
  }

  return new CertificationCpfCountry(result);
};

export { getByMatcher };
