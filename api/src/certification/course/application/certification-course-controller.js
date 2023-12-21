import { usecases } from '../../shared/domain/usecases/index.js';
import * as events from '../../../../lib/domain/events/index.js';
import * as assessmentResultSerializer from '../infrastructure/serializers/jsonapi/assessment-result-serializer.js';
import * as v3CertificationDetailsForAdministrationSerializer from '../infrastructure/serializers/jsonapi/v3-certification-course-details-for-administration-serializer.js';

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

const unreject = async function (request, h, dependencies = { events }) {
  const certificationCourseId = request.params.id;
  const juryId = request.auth.credentials.userId;
  const certificationCourseRejectedEvent = await usecases.unrejectCertificationCourse({
    certificationCourseId,
    juryId,
  });

  await dependencies.events.eventDispatcher.dispatch(certificationCourseRejectedEvent);
  return h.response().code(200);
};

const updateJuryComments = async function (request, h, dependencies = { assessmentResultSerializer }) {
  const certificationCourseId = request.params.id;
  const deserializedAssessmentResult = await dependencies.assessmentResultSerializer.deserialize(request.payload);
  const juryId = request.auth.credentials.userId;

  await usecases.updateJuryComments({
    certificationCourseId,
    assessmentResult: { ...deserializedAssessmentResult, juryId },
  });

  return null;
};

const getCertificationV3Details = async function (
  request,
  h,
  dependencies = { v3CertificationDetailsForAdministrationSerializer },
) {
  const certificationCourseId = request.params.id;
  const certificationDetails = await usecases.getV3CertificationCourseDetailsForAdministration({
    certificationCourseId,
  });

  return h
    .response(dependencies.v3CertificationDetailsForAdministrationSerializer.serialize({ certificationDetails }))
    .code(200);
};

export const certificationCourseController = {
  reject,
  unreject,
  getCertificationV3Details,
  updateJuryComments,
};
