import { CertificationCourseUnrejected } from '../../../../shared/domain/events/CertificationCourseUnrejected.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';

export async function unrejectCertificationCourse({
  certificationCourseId,
  juryId,
  certificationCourseRepository,
  certificationEvaluationRepository,
}) {
  const certificationCourse = await certificationCourseRepository.get({ id: certificationCourseId });
  certificationCourse.unrejectForFraud();
  await certificationCourseRepository.update({ certificationCourse });

  const event = new CertificationCourseUnrejected({ certificationCourseId, juryId });

  if (AlgorithmEngineVersion.isV3(certificationCourse.getVersion())) {
    return certificationEvaluationRepository.rescoreV3Certification({ event });
  }

  if (AlgorithmEngineVersion.isV2(certificationCourse.getVersion())) {
    return certificationEvaluationRepository.rescoreV2Certification({ event });
  }
}
