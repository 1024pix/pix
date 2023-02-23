const { knex } = require('../../../db/knex-database-connection.js');
const CertificationCpfCity = require('../../domain/models/CertificationCpfCity.js');

const COLUMNS = ['id', 'name', 'postalCode', 'INSEECode', 'isActualName'];

module.exports = {
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
