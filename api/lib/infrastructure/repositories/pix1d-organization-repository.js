import { knex } from '../../../db/knex-database-connection.js';

const save = async function ({ organizationId }) {
  const [organizationCreated] = await knex('pix1d-organizations')
    .insert({ organizationId, code: 'MINIPIXOU' })
    .returning('*');
  return organizationCreated.code;
};

export { save };
