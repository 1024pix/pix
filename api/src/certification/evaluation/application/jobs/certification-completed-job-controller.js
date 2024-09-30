import { CertificationCompletedJob } from '../../../../../lib/domain/events/CertificationCompleted.js';
import { CertificationScoringCompleted } from '../../../../../lib/domain/events/CertificationScoringCompleted.js';
import * as events from '../../../../../lib/domain/events/index.js';
import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { V3_REPRODUCIBILITY_RATE } from '../../../../shared/domain/constants.js';
import { CertificationComputeError } from '../../../../shared/domain/errors.js';
import { AssessmentResult } from '../../../../shared/domain/models/index.js';
import { AssessmentResultFactory } from '../../../scoring/domain/models/factories/AssessmentResultFactory.js';
import { assessmentResultRepository } from '../../../session-management/infrastructure/repositories/index.js';
import { CertificationVersion } from '../../../shared/domain/models/CertificationVersion.js';
import * as scoringCertificationService from '../../../shared/domain/services/scoring-certification-service.js';
import * as certificationAssessmentRepository from '../../../shared/infrastructure/repositories/certification-assessment-repository.js';
import * as certificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
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
      scoringCertificationService,
      services,
      events,
    },
  }) {
    const { assessmentId, locale } = data;

    const {
      assessmentResultRepository,
      certificationAssessmentRepository,
      certificationCourseRepository,
      scoringCertificationService,
      services,
      events,
    } = dependencies;

    const certificationAssessment = await certificationAssessmentRepository.get(assessmentId);
    let certificationScoringCompletedEvent;

    if (CertificationVersion.isV3(certificationAssessment.version)) {
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
        scoringCertificationService,
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
  scoringCertificationService,
  services,
}) {
  const emitter = AssessmentResult.emitters.PIX_ALGO;

  try {
    const { certificationCourse, certificationAssessmentScore } = await services.handleV2CertificationScoring({
      emitter,
      certificationAssessment,
    });

    certificationCourse.complete({ now: new Date() });

    const lackOfAnswersForTechnicalReason = await scoringCertificationService.isLackOfAnswersForTechnicalReason({
      certificationCourse,
      certificationAssessmentScore,
    });

    if (lackOfAnswersForTechnicalReason) {
      certificationCourse.cancel();
    }

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
      emitter,
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
  const emitter = AssessmentResult.emitters.PIX_ALGO;
  const certificationCourse = await services.handleV3CertificationScoring({
    certificationAssessment,
    emitter,
    locale,
  });

  if (!certificationCourse.isCancelled()) {
    certificationCourse.complete({ now: new Date() });
  }
  await certificationCourseRepository.update({ certificationCourse });

  return new CertificationScoringCompleted({
    userId: certificationAssessment.userId,
    certificationCourseId: certificationAssessment.certificationCourseId,
    reproducibilityRate: V3_REPRODUCIBILITY_RATE,
  });
}

async function _saveResultAfterCertificationComputeError({
  emitter,
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
    emitter,
  });
  await assessmentResultRepository.save({
    certificationCourseId: certificationAssessment.certificationCourseId,
    assessmentResult,
  });
  certificationCourse.complete({ now: new Date() });
  return certificationCourseRepository.update({ certificationCourse });
}
