/**
 * @typedef {import('../../domain/usecases/index.js').SessionJuryCommentRepository} SessionJuryCommentRepository
 */

/**
 * @param {Object} params
 * @param {number} params.sessionId
 * @param {string} params.juryComment
 * @param {number} params.juryCommentAuthorId
 * @param {SessionJuryCommentRepository} params.sessionJuryCommentRepository
 **/
const commentSessionAsJury = async function ({
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
};

export { commentSessionAsJury };
