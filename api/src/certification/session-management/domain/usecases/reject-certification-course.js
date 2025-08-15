import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import * as injectedCertificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import * as injectedCertificationRescoringRepository from '../../infrastructure/repositories/certification-rescoring-repository.js';
import { CertificationCourseRejected } from '../events/CertificationCourseRejected.js';

export const rejectCertificationCourse = async ({
  certificationCourseId,
  juryId,
  certificationCourseRepository = injectedCertificationCourseRepository,
  certificationRescoringRepository = injectedCertificationRescoringRepository,
} = {}) => {
  const certificationCourse = await certificationCourseRepository.get({ id: certificationCourseId });
  certificationCourse.rejectForFraud();
  await certificationCourseRepository.update({ certificationCourse });

  const event = new CertificationCourseRejected({ certificationCourseId, juryId });

  if (AlgorithmEngineVersion.isV3(certificationCourse.getVersion())) {
    return certificationRescoringRepository.rescoreV3Certification({ event });
  }

  if (AlgorithmEngineVersion.isV2(certificationCourse.getVersion())) {
    return certificationRescoringRepository.rescoreV2Certification({ event });
  }
};
