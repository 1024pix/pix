import { knex } from '../../../db/knex-database-connection';
import CertificationCpfCountry from '../../domain/models/CertificationCpfCountry';

export default {
  async getByMatcher({ matcher }) {
    const COLUMNS = ['id', 'code', 'commonName', 'originalName', 'matcher'];

    const result = await knex.select(COLUMNS).from('certification-cpf-countries').where({ matcher }).first();

    if (!result) {
      return null;
    }

    return new CertificationCpfCountry(result);
  },
};
