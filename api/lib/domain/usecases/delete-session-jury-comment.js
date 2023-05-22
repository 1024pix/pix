const deleteSessionJuryComment = async function ({ sessionId, sessionJuryCommentRepository }) {
  await sessionJuryCommentRepository.remove(sessionId);
};

export { deleteSessionJuryComment };
