import { DomainTransaction } from '../../../src/shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../src/shared/domain/errors.js';
import { Framework } from '../../../src/shared/domain/models/Framework.js';

const TABLE_NAME = 'learningcontent.frameworks';

export async function list() {
  const knex = DomainTransaction.getConnection();
  const frameworkDtos = await knex.select('*').from(TABLE_NAME).orderBy('name');
  return frameworkDtos.map(toDomain);
}

export async function getByName(name) {
  const knex = DomainTransaction.getConnection();
  const frameworkDto = await knex.select('*').from(TABLE_NAME).where('name', name).first();
  if (!frameworkDto) {
    throw new NotFoundError(`Framework not found for name ${name}`);
  }
  return toDomain(frameworkDto);
}

export async function findByRecordIds(frameworkIds) {
  const knex = DomainTransaction.getConnection();
  const frameworkDtos = await knex.select('*').from(TABLE_NAME).whereIn('id', frameworkIds).orderBy('name');
  return frameworkDtos.map(toDomain);
}

function toDomain(frameworkData) {
  return new Framework({
    id: frameworkData.id,
    name: frameworkData.name,
    areas: [],
  });
}
