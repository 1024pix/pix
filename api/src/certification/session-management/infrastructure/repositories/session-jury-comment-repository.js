import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { SessionJuryComment } from '../../domain/models/SessionJuryComment.js';

const get = async function ({ id }) {
  const result = await knex
    .select({
      id: 'id',
      comment: 'juryComment',
      authorId: 'juryCommentAuthorId',
      updatedAt: 'juryCommentedAt',
    })
    .from('sessions')
    .where({ id })
    .first();

  if (!result) {
    throw new NotFoundError(`La session ${id} n'existe pas ou son accès est restreint.`);
  }

  return new SessionJuryComment(result);
};

const save = async function ({ sessionJuryComment }) {
  const columnsToSave = {
    juryComment: sessionJuryComment.comment,
    juryCommentAuthorId: sessionJuryComment.authorId,
    juryCommentedAt: sessionJuryComment.updatedAt,
  };
  await _persist(sessionJuryComment.id, columnsToSave);
};

const remove = async function ({ id }) {
  const columnsToSave = {
    juryComment: null,
    juryCommentAuthorId: null,
    juryCommentedAt: null,
  };
  await _persist(id, columnsToSave);
};

export { get, remove, save };

async function _persist(sessionId, columnsToSave) {
  const updatedSessionIds = await knex('sessions').update(columnsToSave).where({ id: sessionId }).returning('id');

  if (updatedSessionIds.length === 0) {
    throw new NotFoundError(`La session ${sessionId} n'existe pas ou son accès est restreint.`);
  }
}
