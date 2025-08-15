import * as injectedSessionJuryCommentRepository from '../../infrastructure/repositories/session-jury-comment-repository.js'; /**
 * @typedef {import('../../domain/usecases/index.js').SessionJuryCommentRepository} SessionJuryCommentRepository
 */

/**
 * @param {Object} params
 * @param {number} params.sessionId
 * @param {SessionJuryCommentRepository} params.sessionJuryCommentRepository
 **/
const deleteSessionJuryComment = async function ({
  sessionId,
  sessionJuryCommentRepository = injectedSessionJuryCommentRepository,
} = {}) {
  await sessionJuryCommentRepository.remove({ id: sessionId });
};

export { deleteSessionJuryComment };
