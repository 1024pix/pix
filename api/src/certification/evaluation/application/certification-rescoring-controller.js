import { CertificationRescoringNotAllowedError } from '../../../shared/domain/errors.js';
import * as courseAssessmentResultRepository from '../../session-management/infrastructure/repositories/course-assessment-result-repository.js';
import { AlgorithmEngineVersion } from '../../shared/domain/models/AlgorithmEngineVersion.js';
import * as certificationCourseRepository from '../../shared/infrastructure/repositories/certification-course-repository.js';
import CertificationRescored from '../domain/events/CertificationRescored.js';
import { usecases } from '../domain/usecases/index.js';

const rescoreCertification = async function (
  request,
  h,
  dependencies = { certificationCourseRepository, courseAssessmentResultRepository },
) {
  const juryId = request.auth.credentials.userId;
  const certificationCourseId = request.params.certificationCourseId;

  const certificationCourse = await dependencies.certificationCourseRepository.get({ id: certificationCourseId });

  const latestAssessmentResult = await dependencies.courseAssessmentResultRepository.getLatestAssessmentResult({
    certificationCourseId,
  });
  if (_isAssessmentResultNotRescorable(latestAssessmentResult)) {
    throw new CertificationRescoringNotAllowedError();
  }

  if (AlgorithmEngineVersion.isV3(certificationCourse.getVersion())) {
    await usecases.scoreV3Certification({
      certificationCourseId,
      event: new CertificationRescored({ certificationCourseId, juryId }),
    });
  }

  if (AlgorithmEngineVersion.isV2(certificationCourse.getVersion())) {
    await usecases.rescoreV2Certification({
      event: new CertificationRescored({ certificationCourseId, juryId }),
    });
  }

  return h.response().code(201);
};

const _isAssessmentResultNotRescorable = (latestAssessmentResult) => {
  return (
    latestAssessmentResult &&
    (latestAssessmentResult.status === 'cancelled' || latestAssessmentResult.status === 'rejected')
  );
};

const certificationRescoringController = {
  rescoreCertification,
};

export { certificationRescoringController };
