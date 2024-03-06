import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { Passage } from '../../domain/models/Passage.js';
import { NotFoundError } from '../../../shared/domain/errors.js';

const save = async ({ moduleId, userId, domainTransaction = DomainTransaction.emptyTransaction() }) => {
  const knexConn = domainTransaction?.knexTransaction || knex;
  const [passage] = await knexConn('passages')
    .insert({
      moduleId,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning('*');

  return _toDomain(passage);
};

const get = async ({ passageId, domainTransaction = DomainTransaction.emptyTransaction() }) => {
  const knexConn = domainTransaction?.knexTransaction || knex;
  const passage = await knexConn('passages').where({ id: passageId }).first();
  if (!passage) {
    throw new NotFoundError();
  }

  return _toDomain(passage);
};

const update = async ({ passage, domainTransaction = DomainTransaction.emptyTransaction() }) => {
  const knexConn = domainTransaction?.knexTransaction || knex;
  const [updatedPassage] = await knexConn('passages')
    .where({ id: passage.id })
    .update({
      ...passage,
      updatedAt: new Date(),
    })
    .returning('*');

  return _toDomain(updatedPassage);
};

function _toDomain({ id, moduleId, userId, createdAt, updatedAt, terminatedAt }) {
  return new Passage({ id, moduleId, userId, createdAt, updatedAt, terminatedAt });
}

export { get, save, update };
