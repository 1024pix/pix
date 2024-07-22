import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { Passage } from '../../domain/models/Passage.js';

const save = async ({ moduleId, userId }) => {
  const knexConn = DomainTransaction.getConnection();
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

const get = async ({ passageId }) => {
  const knexConn = DomainTransaction.getConnection();
  const passage = await knexConn('passages').where({ id: passageId }).first();
  if (!passage) {
    throw new NotFoundError();
  }

  return _toDomain(passage);
};

const update = async ({ passage }) => {
  const knexConn = DomainTransaction.getConnection();
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
