import { NotFoundError } from '../../../shared/domain/errors.js';
import { usecases } from '../domain/usecases/index.js';
import * as certificationCourseInfoRepository from '../infrastructure/repositories/certification-course-info-repository.js';
import * as certificationCourseInfoSerializer from '../infrastructure/serializers/certification-course-info-serializer.js';
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

export async function get(
  request,
  h,
  dependencies = { certificationCourseInfoRepository, certificationCourseInfoSerializer },
) {
  const { certificationCourseId } = request.params;
  const certificationCourseInfo = await dependencies.certificationCourseInfoRepository.find(certificationCourseId);
  if (!certificationCourseInfo) {
    throw new NotFoundError('Certification does not exist');
  }
  return dependencies.certificationCourseInfoSerializer.serialize(certificationCourseInfo);
}

export const certificationCourseController = {
  save,
  get,
};
