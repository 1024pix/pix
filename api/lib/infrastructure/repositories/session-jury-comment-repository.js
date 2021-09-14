const { knex } = require('../../../db/knex-database-connection');
const { NotFoundError } = require('../../domain/errors');
const SessionJuryComment = require('../../domain/models/SessionJuryComment');

module.exports = {

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
};
