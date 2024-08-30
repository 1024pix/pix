import { extractLocaleFromRequest } from '../../../src/shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';
import * as certifiedProfileRepository from '../../infrastructure/repositories/certified-profile-repository.js';
import * as certificationCourseSerializer from '../../infrastructure/serializers/jsonapi/certification-course-serializer.js';
import * as certifiedProfileSerializer from '../../infrastructure/serializers/jsonapi/certified-profile-serializer.js';

const save = async function (request, h, dependencies = { extractLocaleFromRequest, certificationCourseSerializer }) {
  const userId = request.auth.credentials.userId;
  const accessCode = request.payload.data.attributes['access-code'];
  const sessionId = request.payload.data.attributes['session-id'];
  const locale = dependencies.extractLocaleFromRequest(request);

  const { created, certificationCourse } = await usecases.retrieveLastOrCreateCertificationCourse({
    sessionId,
    accessCode,
    userId,
    locale,
  });

  const serialized = await dependencies.certificationCourseSerializer.serialize(certificationCourse);

  return created ? h.response(serialized).created() : serialized;
};

const get = async function (request, h, dependencies = { certificationCourseSerializer }) {
  const certificationCourseId = request.params.id;
  const certificationCourse = await usecases.getCertificationCourse({ certificationCourseId });
  return dependencies.certificationCourseSerializer.serialize(certificationCourse);
};

const getCertifiedProfile = async function (
  request,
  h,
  dependencies = { certifiedProfileRepository, certifiedProfileSerializer },
) {
  const certificationCourseId = request.params.id;
  const certifiedProfile = await dependencies.certifiedProfileRepository.get(certificationCourseId);
  return dependencies.certifiedProfileSerializer.serialize(certifiedProfile);
};

const certificationCourseController = {
  save,
  get,
  getCertifiedProfile,
};

export { certificationCourseController };
