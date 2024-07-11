import * as events from '../../../../lib/domain/events/index.js';
import { usecases as libUsecases } from '../../../../lib/domain/usecases/index.js';
import { usecases } from '../domain/usecases/index.js';
import * as certificationSerializer from '../infrastructure/serializers/certification-serializer.js';
import * as juryCommentSerializer from '../infrastructure/serializers/jury-comment-serializer.js';
import * as v3CertificationDetailsForAdministrationSerializer from '../infrastructure/serializers/v3-certification-course-details-for-administration-serializer.js';

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

const updateJuryComment = async function (request, h, dependencies = { juryCommentSerializer }) {
  const certificationCourseId = request.params.id;
  const assessmentResultCommentByJury = await dependencies.juryCommentSerializer.deserialize(request.payload);
  const juryId = request.auth.credentials.userId;

  await usecases.updateJuryComment({
    certificationCourseId,
    assessmentResultCommentByJury,
    juryId,
  });

  return null;
};

const getCertificationV3Details = async function (
  request,
  h,
  dependencies = { v3CertificationDetailsForAdministrationSerializer },
) {
  const { certificationCourseId } = request.params;
  const certificationDetails = await usecases.getV3CertificationCourseDetailsForAdministration({
    certificationCourseId,
  });

  return h
    .response(dependencies.v3CertificationDetailsForAdministrationSerializer.serialize({ certificationDetails }))
    .code(200);
};

const update = async function (request, h, dependencies = { certificationSerializer }) {
  const certificationCourseId = request.params.certificationCourseId;
  const userId = request.auth.credentials.userId;
  const command = await dependencies.certificationSerializer.deserializeCertificationCandidateModificationCommand(
    request.payload,
    certificationCourseId,
    userId,
  );
  await usecases.correctCandidateIdentityInCertificationCourse({ command });
  const updatedCertificationCourse = await libUsecases.getCertificationCourse({
    certificationCourseId: command.certificationCourseId,
  });
  return dependencies.certificationSerializer.serializeFromCertificationCourse(updatedCertificationCourse);
};

export const certificationCourseController = {
  reject,
  unreject,
  getCertificationV3Details,
  update,
  updateJuryComment,
};
