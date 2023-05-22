import { SessionJuryComment } from '../../../../lib/domain/models/SessionJuryComment.js';

const buildSessionJuryComment = function ({
  id = 123,
  comment = 'Un commentaire du pôle certif',
  authorId = 456,
  updatedAt = new Date('2021-07-21T01:02:23Z'),
} = {}) {
  return new SessionJuryComment({
    id,
    comment,
    authorId,
    updatedAt,
  });
};

export { buildSessionJuryComment };
