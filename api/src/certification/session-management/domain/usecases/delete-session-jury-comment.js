/**
 * @typedef {import('../../domain/usecases/index.js').SessionJuryCommentRepository} SessionJuryCommentRepository
 */

/**
 * @param {object} params
 * @param {number} params.sessionId
 * @param {SessionJuryCommentRepository} params.sessionJuryCommentRepository
 **/
export async function deleteSessionJuryComment({ sessionId, sessionJuryCommentRepository }) {
  await sessionJuryCommentRepository.remove({ id: sessionId });
}
