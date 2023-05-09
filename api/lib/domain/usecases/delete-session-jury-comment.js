const deleteSessionJuryComment = async function ({ sessionId, sessionJuryCommentRepository }) {
  await sessionJuryCommentRepository.delete(sessionId);
};

export { deleteSessionJuryComment };
