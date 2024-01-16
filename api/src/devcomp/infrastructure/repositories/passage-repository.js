import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import { Passage } from '../../domain/models/Passage.js';
import { NotFoundError } from '../../../shared/domain/errors.js';

const save = async function ({ moduleId, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConn = domainTransaction?.knexTransaction || knex;
  const [passage] = await knexConn('passages')
    .insert({
      moduleId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning('*');

  return _toDomain(passage);
};

const get = async function ({ passageId, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConn = domainTransaction?.knexTransaction || knex;
  const passage = await knexConn('passages').where({ id: passageId }).first();
  if (!passage) {
    throw new NotFoundError();
  }

  return _toDomain(passage);
};

function _toDomain({ id, moduleId, createdAt, updatedAt }) {
  return new Passage({ id, moduleId, createdAt, updatedAt });
}

export { get, save };
