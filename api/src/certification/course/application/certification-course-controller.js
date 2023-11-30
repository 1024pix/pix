import { usecases } from '../../shared/domain/usecases/index.js';

const reject = async function (request, h) {
  const certificationCourseId = request.params.id;
  await usecases.rejectCertificationCourse({ certificationCourseId });
  return h.response().code(200);
};

export const certificationCourseController = {
  reject,
};
