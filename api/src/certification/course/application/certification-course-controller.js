import { usecases } from '../../shared/domain/usecases/index.js';
import * as events from '../../../../lib/domain/events/index.js';

const reject = async function (request, h, dependencies = { events }) {
  const certificationCourseId = request.params.id;
  const juryId = request.auth.credentials.userId;
  const certificationCourseRejectedEvent = await usecases.rejectCertificationCourse({
    certificationCourseId,
    juryId,
  });

  await dependencies.events.eventDispatcher.dispatch(certificationCourseRejectedEvent);
  return h.response().code(200);
};

export const certificationCourseController = {
  reject,
};
