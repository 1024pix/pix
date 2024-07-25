import { usecases as libUsecases } from '../../../../lib/domain/usecases/index.js';
import { usecases } from '../domain/usecases/index.js';
import * as certificationSerializer from '../infrastructure/serializers/certification-serializer.js';

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

const certificationCourseController = {
  update,
};

export { certificationCourseController };
