import { NotFoundError } from '../../../../shared/domain/errors.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import { CertificationCourseRejected } from '../events/CertificationCourseRejected.js';

export const rejectCertificationCourse = async ({
  certificationCourseId,
  juryId,
  certificationCourseRepository,
  certificationEvaluationRepository,
  courseAssessmentResultRepository,
}) => {
  const certificationCourse = await certificationCourseRepository.get({ id: certificationCourseId });

  const latestAssessmentResult = await courseAssessmentResultRepository.getLatestAssessmentResult({
    certificationCourseId,
  });
  if (!latestAssessmentResult) {
    throw new NotFoundError('No assessment result found');
  }

  certificationCourse.rejectForFraud();
  await certificationCourseRepository.update({ certificationCourse });

  const event = new CertificationCourseRejected({ certificationCourseId, juryId });

  if (AlgorithmEngineVersion.isV3(certificationCourse.getVersion())) {
    return certificationEvaluationRepository.rescoreV3Certification({ event });
  }

  if (AlgorithmEngineVersion.isV2(certificationCourse.getVersion())) {
    return certificationEvaluationRepository.rescoreV2Certification({ event });
  }
};
