import { knex } from '../../../../../db/knex-database-connection.js';

const findFileNamesByStatus = async function ({ cpfImportStatus }) {
  return knex('certification-courses-cpf-infos').where({ importStatus: cpfImportStatus }).pluck('filename').distinct();
};

export { findFileNamesByStatus };
