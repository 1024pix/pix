module.exports = async function deleteSessionJuryComment({ sessionId, sessionJuryCommentRepository }) {
  await sessionJuryCommentRepository.delete(sessionId);
};
