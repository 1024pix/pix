import { knex } from '../../../../db/knex-database-connection.js';
import { School } from '../../domain/models/School.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

const save = async function ({ organizationId, code }) {
  const [organizationCreated] = await knex('schools').insert({ organizationId, code }).returning('*');
  return organizationCreated.code;
};

const isCodeAvailable = async function (code) {
  return !(await knex('schools').first('id').where({ code }));
};

const getByCode = async function (code) {
  const data = await knex('schools')
    .select('organizations.id', 'name', 'code')
    .join('organizations', 'organizations.id', 'organizationId')
    .where({ code })
    .first();

  if (!data) {
    throw new NotFoundError(`No school found for code ${code}`);
  }

  return new School(data);
};

const getById = async function (organizationId) {
  const result = await knex('schools').first('code').where({ organizationId });
  return result.code;
};

export { save, isCodeAvailable, getByCode, getById };
