export default async function deleteSessionJuryComment({ sessionId, sessionJuryCommentRepository }) {
  await sessionJuryCommentRepository.delete(sessionId);
}
