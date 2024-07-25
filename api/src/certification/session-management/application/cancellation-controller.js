import { usecases } from '../domain/usecases/index.js';

const cancel = async function (request, h) {
  const certificationCourseId = request.params.id;
  await usecases.cancelCertificationCourse({ certificationCourseId });
  return h.response().code(200);
};

const cancellationController = {
  cancel,
};

export { cancellationController };
