import { knex } from '../../../../db/knex-database-connection';
import { NotFoundError } from '../../../domain/errors';
import SessionJuryComment from '../../../domain/models/SessionJuryComment';

export default {
  async get(sessionId) {
    const result = await knex
      .select({
        id: 'id',
        comment: 'juryComment',
        authorId: 'juryCommentAuthorId',
        updatedAt: 'juryCommentedAt',
      })
      .from('sessions')
      .where({ id: sessionId })
      .first();

    if (!result) {
      throw new NotFoundError(`La session ${sessionId} n'existe pas ou son accès est restreint.`);
    }

    return new SessionJuryComment(result);
  },

  async save(sessionJuryComment) {
    const columnsToSave = {
      juryComment: sessionJuryComment.comment,
      juryCommentAuthorId: sessionJuryComment.authorId,
      juryCommentedAt: sessionJuryComment.updatedAt,
    };
    await _persist(sessionJuryComment.id, columnsToSave);
  },

  async delete(sessionJuryCommentId) {
    const columnsToSave = {
      juryComment: null,
      juryCommentAuthorId: null,
      juryCommentedAt: null,
    };
    await _persist(sessionJuryCommentId, columnsToSave);
  },
};

async function _persist(sessionId, columnsToSave) {
  const updatedSessionIds = await knex('sessions').update(columnsToSave).where({ id: sessionId }).returning('id');

  if (updatedSessionIds.length === 0) {
    throw new NotFoundError(`La session ${sessionId} n'existe pas ou son accès est restreint.`);
  }
}
