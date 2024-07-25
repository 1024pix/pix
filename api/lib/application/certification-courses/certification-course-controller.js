import { extractLocaleFromRequest } from '../../../src/shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';
import * as certifiedProfileRepository from '../../infrastructure/repositories/certified-profile-repository.js';
import * as certificationCourseSerializer from '../../infrastructure/serializers/jsonapi/certification-course-serializer.js';
import * as certifiedProfileSerializer from '../../infrastructure/serializers/jsonapi/certified-profile-serializer.js';
import * as juryCertificationSerializer from '../../infrastructure/serializers/jsonapi/jury-certification-serializer.js';

const getJuryCertification = async function (request, h, dependencies = { juryCertificationSerializer }) {
  const certificationCourseId = request.params.id;
  const translate = request.i18n.__;
  const juryCertification = await usecases.getJuryCertification({ certificationCourseId });

  return dependencies.juryCertificationSerializer.serialize(juryCertification, { translate });
};

const save = async function (request, h, dependencies = { extractLocaleFromRequest, certificationCourseSerializer }) {
  const userId = request.auth.credentials.userId;
  const accessCode = request.payload.data.attributes['access-code'];
  const sessionId = request.payload.data.attributes['session-id'];
  const locale = dependencies.extractLocaleFromRequest(request);

  const { created, certificationCourse } = await DomainTransaction.execute((domainTransaction) => {
    return usecases.retrieveLastOrCreateCertificationCourse({
      domainTransaction,
      sessionId,
      accessCode,
      userId,
      locale,
    });
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
  getJuryCertification,
  save,
  get,
  getCertifiedProfile,
};

export { certificationCourseController };
