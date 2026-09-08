/**
 * @typedef {import('../../domain/usecases/index.js').SessionJuryCommentRepository} SessionJuryCommentRepository
 */

/**
 * @param {object} params
 * @param {number} params.sessionId
 * @param {string} params.juryComment
 * @param {number} params.juryCommentAuthorId
 * @param {SessionJuryCommentRepository} params.sessionJuryCommentRepository
 **/
export async function commentSessionAsJury({
  sessionId,
  juryComment,
  juryCommentAuthorId,
  sessionJuryCommentRepository,
}) {
  const sessionJuryComment = await sessionJuryCommentRepository.get({ id: sessionId });

  sessionJuryComment.update({
    comment: juryComment,
    authorId: juryCommentAuthorId,
  });

  await sessionJuryCommentRepository.save({ sessionJuryComment });
}
