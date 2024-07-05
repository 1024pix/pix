import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { Division } from '../../domain/models/Division.js';
import { School } from '../../domain/models/School.js';
import { SchoolNotFoundError } from '../../domain/school-errors.js';

const save = async function ({ organizationId, code, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConn = domainTransaction.knexTransaction ?? knex;
  await knexConn('schools').insert({ organizationId, code }).returning('*');
};

const isCodeAvailable = async function ({ code }) {
  return !(await knex('schools').first('id').where({ code }));
};

const getByCode = async function ({ code }) {
  const data = await knex('schools')
    .select('organizations.id', 'name', 'code')
    .join('organizations', 'organizations.id', 'organizationId')
    .where({ code })
    .first();

  if (!data) {
    throw new SchoolNotFoundError(`No school found for code ${code}`);
  }

  return new School(data);
};

const getById = async function ({ organizationId }) {
  const result = await knex('schools').first('code').where({ organizationId });
  return result.code;
};

const updateSessionExpirationDate = async function ({ organizationId, sessionExpirationDate }) {
  await knex('schools').where({ organizationId }).update({ sessionExpirationDate });
};

const getDivisions = async function ({ organizationId, organizationLearnerApi }) {
  const { organizationLearners } = await organizationLearnerApi.find({
    organizationId,
  });
  const divisionLearners = organizationLearners.map((organizationLearner) => organizationLearner.division);
  return [...new Set(divisionLearners)].sort().map((divisionName) => new Division({ name: divisionName }));
};

const getSessionExpirationDate = async function ({ code }) {
  const [sessionExpirationDate] = await knex('schools')
    .select('sessionExpirationDate')
    .where({ code })
    .pluck('sessionExpirationDate');
  return sessionExpirationDate;
};

export {
  getByCode,
  getById,
  getDivisions,
  getSessionExpirationDate,
  isCodeAvailable,
  save,
  updateSessionExpirationDate,
};
