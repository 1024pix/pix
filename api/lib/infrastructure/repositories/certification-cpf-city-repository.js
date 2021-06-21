const { knex } = require('../bookshelf');
const CertificationCpfCity = require('../../domain/models/CertificationCpfCity');

module.exports = {

  async findByINSEECode({ INSEECode }) {
    const COLUMNS = [
      'id',
      'name',
      'postalCode',
      'INSEECode',
      'isActualName',
    ];

    const result = await knex
      .select(COLUMNS)
      .from('certification-cpf-cities')
      .where({ INSEECode })
      .orderBy('isActualName', 'desc');

    return result.map((city) => new CertificationCpfCity(city));
  },
};
