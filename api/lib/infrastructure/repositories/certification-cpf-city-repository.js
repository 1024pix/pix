import { knex } from '../../../db/knex-database-connection';
import CertificationCpfCity from '../../domain/models/CertificationCpfCity';

const COLUMNS = ['id', 'name', 'postalCode', 'INSEECode', 'isActualName'];

export default {
  async findByINSEECode({ INSEECode }) {
    const result = await knex
      .select(COLUMNS)
      .from('certification-cpf-cities')
      .where({ INSEECode })
      .orderBy('isActualName', 'desc')
      .orderBy('id');

    return result.map((city) => new CertificationCpfCity(city));
  },

  async findByPostalCode({ postalCode }) {
    const result = await knex
      .select(COLUMNS)
      .from('certification-cpf-cities')
      .where({ postalCode })
      .orderBy('isActualName', 'desc')
      .orderBy('id');

    return result.map((city) => new CertificationCpfCity(city));
  },
};
