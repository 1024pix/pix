import { usecases } from '../domain/usecases/index.js';

async function cancel(request, h) {
  const juryId = request.auth.credentials.userId;
  const certificationCourseId = request.params.certificationCourseId;
  await usecases.cancel({ certificationCourseId, juryId });

  return h.response().code(204);
}

async function uncancel(request, h) {
  const juryId = request.auth.credentials.userId;
  const certificationCourseId = request.params.certificationCourseId;
  await usecases.uncancel({ certificationCourseId, juryId });

  return h.response().code(204);
}

export const cancellationController = {
  cancel,
  uncancel,
};
