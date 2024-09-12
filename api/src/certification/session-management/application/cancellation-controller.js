import { usecases } from '../domain/usecases/index.js';

const cancel = async function (request, h) {
  const certificationCourseId = request.params.certificationCourseId;
  await usecases.cancelCertificationCourse({ certificationCourseId });
  return h.response().code(204);
};

const uncancel = async function (request, h) {
  const certificationCourseId = request.params.certificationCourseId;
  await usecases.uncancelCertificationCourse({ certificationCourseId });
  return h.response().code(204);
};

const cancellationController = {
  cancel,
  uncancel,
};

export { cancellationController };
