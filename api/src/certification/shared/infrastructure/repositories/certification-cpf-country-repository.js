import { knex } from '../../../../../db/knex-database-connection.js';
import { CertificationCpfCountry } from '../../../../certification/shared/domain/models/CertificationCpfCountry.js';

const getByMatcher = async function ({ matcher }) {
  const COLUMNS = ['id', 'code', 'commonName', 'originalName', 'matcher'];

  const result = await knex.select(COLUMNS).from('certification-cpf-countries').where({ matcher }).first();

  if (!result) {
    return null;
  }

  return new CertificationCpfCountry(result);
};

export { getByMatcher };
