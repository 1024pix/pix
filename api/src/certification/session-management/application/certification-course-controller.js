import { getI18nFromRequest } from '../../../shared/infrastructure/i18n/i18n.js';
import { usecases } from '../domain/usecases/index.js';
import * as certificationSerializer from '../infrastructure/serializers/certification-serializer.js';
import * as juryCertificationSerializer from '../infrastructure/serializers/jury-certification-serializer.js';
import * as juryCommentSerializer from '../infrastructure/serializers/jury-comment-serializer.js';
import * as v3CertificationDetailsForAdministrationSerializer from '../infrastructure/serializers/v3-certification-course-details-for-administration-serializer.js';

async function reject(request, h) {
  const certificationCourseId = request.params.certificationCourseId;
  const juryId = request.auth.credentials.userId;
  await usecases.rejectCertificationCourse({
    certificationCourseId,
    juryId,
  });
  return h.response().code(204);
}

async function unreject(request, h) {
  const certificationCourseId = request.params.certificationCourseId;
  const juryId = request.auth.credentials.userId;
  await usecases.unrejectCertificationCourse({
    certificationCourseId,
    juryId,
  });
  return h.response().code(204);
}

async function updateJuryComment(request, h, dependencies = { juryCommentSerializer }) {
  const certificationCourseId = request.params.certificationCourseId;
  const assessmentResultCommentByJury = await dependencies.juryCommentSerializer.deserialize(request.payload);
  const juryId = request.auth.credentials.userId;

  await usecases.updateJuryComment({
    certificationCourseId,
    assessmentResultCommentByJury,
    juryId,
  });

  return null;
}

async function getCertificationV3Details(
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
}

async function update(request, h, dependencies = { certificationSerializer }) {
  const certificationCourseId = request.params.certificationCourseId;
  const userId = request.auth.credentials.userId;
  const command = await dependencies.certificationSerializer.deserializeCertificationCandidateModificationCommand(
    request.payload,
    certificationCourseId,
    userId,
  );

  const updatedCertificationCourse = await usecases.correctCandidateIdentityInCertificationCourse({ command });

  return dependencies.certificationSerializer.serializeFromCertificationCourse(updatedCertificationCourse);
}

async function updateEduV3ExternalJuryResult(request, h, dependencies = { juryCertificationSerializer }) {
  const i18n = getI18nFromRequest(request);

  const eduV3ExternalJuryResult = request.payload.data.attributes['edu-v3-external-jury-result'];
  const certificationCourseId = request.params.certificationCourseId;

  const juryCertification = await usecases.updateEduV3ExternalJuryResult({
    certificationCourseId,
    eduV3ExternalJuryResult,
  });

  return h
    .response(dependencies.juryCertificationSerializer.serialize(juryCertification, { translate: i18n.__ }))
    .code(200);
}

export const certificationCourseController = {
  reject,
  unreject,
  getCertificationV3Details,
  update,
  updateJuryComment,
  updateEduV3ExternalJuryResult,
};
