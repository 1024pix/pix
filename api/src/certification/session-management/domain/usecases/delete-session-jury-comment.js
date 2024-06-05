/**
 * @typedef {import('../../domain/usecases/index.js').SessionJuryCommentRepository} SessionJuryCommentRepository
 */

/**
 * @param {Object} params
 * @param {number} params.sessionId
 * @param {SessionJuryCommentRepository} params.sessionJuryCommentRepository
 **/
const deleteSessionJuryComment = async function ({ sessionId, sessionJuryCommentRepository }) {
  await sessionJuryCommentRepository.remove({ id: sessionId });
};

export { deleteSessionJuryComment };
