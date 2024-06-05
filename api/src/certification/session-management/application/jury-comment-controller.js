import { usecases } from '../domain/usecases/index.js';

const commentAsJury = async function (request, h) {
  const sessionId = request.params.id;
  const juryCommentAuthorId = request.auth.credentials.userId;
  const juryComment = request.payload['jury-comment'];
  await usecases.commentSessionAsJury({ sessionId, juryCommentAuthorId, juryComment });

  return h.response().code(204);
};

const deleteJuryComment = async function (request, h) {
  const sessionId = request.params.id;
  await usecases.deleteSessionJuryComment({ sessionId });

  return h.response().code(204);
};

const juryCommentController = {
  commentAsJury,
  deleteJuryComment,
};
export { juryCommentController };
