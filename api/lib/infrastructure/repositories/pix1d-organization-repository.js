import { knex } from '../../../db/knex-database-connection.js';

const save = async function ({ organizationId, code }) {
  const [organizationCreated] = await knex('pix1d-organizations').insert({ organizationId, code }).returning('*');
  return organizationCreated.code;
};

const isCodeAvailable = async function (code) {
  return !(await knex('pix1d-organizations').first('id').where({ code }));
};
export { save, isCodeAvailable };
