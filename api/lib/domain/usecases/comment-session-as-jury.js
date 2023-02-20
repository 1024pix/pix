export default async function commentSessionAsJury({
  sessionId,
  juryComment,
  juryCommentAuthorId,
  sessionJuryCommentRepository,
}) {
  const sessionJuryComment = await sessionJuryCommentRepository.get(sessionId);

  sessionJuryComment.update({
    comment: juryComment,
    authorId: juryCommentAuthorId,
  });

  await sessionJuryCommentRepository.save(sessionJuryComment);
}
