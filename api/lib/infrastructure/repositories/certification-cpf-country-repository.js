const { knex } = require('../../../db/knex-database-connection.js');
const CertificationCpfCountry = require('../../domain/models/CertificationCpfCountry.js');

module.exports = {
  async getByMatcher({ matcher }) {
    const COLUMNS = ['id', 'code', 'commonName', 'originalName', 'matcher'];

    const result = await knex.select(COLUMNS).from('certification-cpf-countries').where({ matcher }).first();

    if (!result) {
      return null;
    }

    return new CertificationCpfCountry(result);
  },
};
