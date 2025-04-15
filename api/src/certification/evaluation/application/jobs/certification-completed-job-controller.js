import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { V3_REPRODUCIBILITY_RATE } from '../../../../shared/domain/constants.js';
import { CertificationComputeError } from '../../../../shared/domain/errors.js';
import * as events from '../../../../shared/domain/events/index.js';
import { AssessmentResultFactory } from '../../../scoring/domain/models/factories/AssessmentResultFactory.js';
import { assessmentResultRepository } from '../../../session-management/infrastructure/repositories/index.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import * as certificationAssessmentRepository from '../../../shared/infrastructure/repositories/certification-assessment-repository.js';
import * as certificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import { CertificationCompletedJob } from '../../domain/events/CertificationCompleted.js';
import { CertificationScoringCompleted } from '../../domain/events/CertificationScoringCompleted.js';
import { services } from '../../domain/services/index.js';

export class CertificationCompletedJobController extends JobController {
  constructor() {
    super(CertificationCompletedJob.name);
  }

  async handle({
    data,
    dependencies = {
      assessmentResultRepository,
      certificationAssessmentRepository,
      certificationCourseRepository,
      services,
      events,
    },
  }) {
    const { assessmentId, locale } = data;

    const {
      assessmentResultRepository,
      certificationAssessmentRepository,
      certificationCourseRepository,
      services,
      events,
    } = dependencies;

    const certificationAssessment = await certificationAssessmentRepository.get(assessmentId);
    let certificationScoringCompletedEvent;

    if (certificationAssessment.isScoringBlockedDueToComplementaryOnlyChallenges) {
      return;
    }

    if (AlgorithmEngineVersion.isV3(certificationAssessment.version)) {
      certificationScoringCompletedEvent = await _handleV3CertificationScoring({
        certificationAssessment,
        locale,
        certificationCourseRepository,
        services,
      });
    } else {
      certificationScoringCompletedEvent = await _handleV2CertificationScoring({
        certificationAssessment,
        assessmentResultRepository,
        certificationCourseRepository,
        services,
      });
    }

    if (certificationScoringCompletedEvent) {
      await events.eventDispatcher.dispatch(certificationScoringCompletedEvent);
    }
  }
}

async function _handleV2CertificationScoring({
  certificationAssessment,
  assessmentResultRepository,
  certificationCourseRepository,
  services,
}) {
  try {
    const { certificationCourse, certificationAssessmentScore } = await services.handleV2CertificationScoring({
      certificationAssessment,
    });

    certificationCourse.complete({ now: new Date() });
    await certificationCourseRepository.update({ certificationCourse });

    return new CertificationScoringCompleted({
      userId: certificationAssessment.userId,
      certificationCourseId: certificationAssessment.certificationCourseId,
      reproducibilityRate: certificationAssessmentScore.percentageCorrectAnswers,
    });
  } catch (error) {
    if (!(error instanceof CertificationComputeError)) {
      throw error;
    }
    await _saveResultAfterCertificationComputeError({
      certificationAssessment,
      assessmentResultRepository,
      certificationCourseRepository,
      certificationComputeError: error,
    });
  }
}

async function _handleV3CertificationScoring({
  certificationAssessment,
  locale,
  certificationCourseRepository,
  services,
}) {
  const certificationCourse = await services.handleV3CertificationScoring({
    certificationAssessment,
    locale,
    dependencies: { findByCertificationCourseIdAndAssessmentId: services.findByCertificationCourseIdAndAssessmentId },
  });

  certificationCourse.complete({ now: new Date() });
  await certificationCourseRepository.update({ certificationCourse });

  return new CertificationScoringCompleted({
    userId: certificationAssessment.userId,
    certificationCourseId: certificationAssessment.certificationCourseId,
    reproducibilityRate: V3_REPRODUCIBILITY_RATE,
  });
}

async function _saveResultAfterCertificationComputeError({
  certificationAssessment,
  assessmentResultRepository,
  certificationCourseRepository,
  certificationComputeError,
}) {
  const certificationCourse = await certificationCourseRepository.get({
    id: certificationAssessment.certificationCourseId,
  });
  const assessmentResult = AssessmentResultFactory.buildAlgoErrorResult({
    error: certificationComputeError,
    assessmentId: certificationAssessment.id,
  });
  await assessmentResultRepository.save({
    certificationCourseId: certificationAssessment.certificationCourseId,
    assessmentResult,
  });
  certificationCourse.complete({ now: new Date() });
  return certificationCourseRepository.update({ certificationCourse });
}
