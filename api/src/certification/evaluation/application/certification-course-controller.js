import { usecases } from '../domain/usecases/index.js';
import * as certificationCourseSerializer from '../infrastructure/serializers/certification-course-serializer.js';

export async function save(request, h, dependencies = { certificationCourseSerializer }) {
  const userId = request.auth.credentials.userId;
  const accessCode = request.payload.data.attributes['access-code'];
  const sessionId = request.payload.data.attributes['session-id'];
  const locale = request.payload.data.attributes['locale'];
  const clientTimezone = request?.headers?.['x-timezone'] ?? null;

  const { created, certificationCourse } = await usecases.retrieveLastOrCreateCertificationCourse({
    sessionId,
    accessCode,
    userId,
    locale,
    clientTimezone,
  });

  const serialized = await dependencies.certificationCourseSerializer.serialize(certificationCourse);

  return created ? h.response(serialized).created() : serialized;
}

export async function get(request, h, dependencies = { certificationCourseSerializer }) {
  const { certificationCourseId } = request.params;
  const certificationCourse = await usecases.getCertificationCourse({ certificationCourseId });
  return dependencies.certificationCourseSerializer.serialize(certificationCourse);
}

export const certificationCourseController = {
  save,
  get,
};
