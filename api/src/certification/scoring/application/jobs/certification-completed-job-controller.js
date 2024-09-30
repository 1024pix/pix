import { CertificationCompletedJob } from '../../../../../lib/domain/events/CertificationCompleted.js';
import { CertificationScoringCompleted } from '../../../../../lib/domain/events/CertificationScoringCompleted.js';
import * as events from '../../../../../lib/domain/events/index.js';
import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { V3_REPRODUCIBILITY_RATE } from '../../../../shared/domain/constants.js';
import { CertificationComputeError } from '../../../../shared/domain/errors.js';
import { AssessmentResult } from '../../../../shared/domain/models/index.js';
import * as answerRepository from '../../../../shared/infrastructure/repositories/answer-repository.js';
import * as challengeRepository from '../../../../shared/infrastructure/repositories/challenge-repository.js';
import * as certificationAssessmentHistoryRepository from '../../../evaluation/infrastructure/repositories/certification-assessment-history-repository.js';
import * as certificationChallengeForScoringRepository from '../../../evaluation/infrastructure/repositories/certification-challenge-for-scoring-repository.js';
import * as flashAlgorithmService from '../../../flash-certification/domain/services/algorithm-methods/flash.js';
import { assessmentResultRepository } from '../../../session-management/infrastructure/repositories/index.js';
import { CertificationVersion } from '../../../shared/domain/models/CertificationVersion.js';
import * as scoringCertificationService from '../../../shared/domain/services/scoring-certification-service.js';
import * as certificationAssessmentRepository from '../../../shared/infrastructure/repositories/certification-assessment-repository.js';
import * as certificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import * as competenceMarkRepository from '../../../shared/infrastructure/repositories/competence-mark-repository.js';
import * as flashAlgorithmConfigurationRepository from '../../../shared/infrastructure/repositories/flash-algorithm-configuration-repository.js';
import { AssessmentResultFactory } from '../../domain/models/factories/AssessmentResultFactory.js';
import { scoringDegradationService } from '../../domain/services/scoring-degradation-service.js';
import * as scoringConfigurationRepository from '../../infrastructure/repositories/scoring-configuration-repository.js';

export class CertificationCompletedJobController extends JobController {
  constructor() {
    super(CertificationCompletedJob.name);
  }

  async handle({
    data,
    dependencies = {
      answerRepository,
      assessmentResultRepository,
      certificationAssessmentHistoryRepository,
      certificationAssessmentRepository,
      certificationCourseRepository,
      certificationChallengeForScoringRepository,
      challengeRepository,
      competenceMarkRepository,
      flashAlgorithmConfigurationRepository,
      flashAlgorithmService,
      scoringCertificationService,
      scoringConfigurationRepository,
      scoringDegradationService,
      events,
    },
  }) {
    const { assessmentId, locale } = data;

    const {
      assessmentResultRepository,
      certificationAssessmentHistoryRepository,
      certificationAssessmentRepository,
      certificationCourseRepository,
      certificationChallengeForScoringRepository,
      competenceMarkRepository,
      scoringConfigurationRepository,
      scoringCertificationService,
      answerRepository,
      flashAlgorithmConfigurationRepository,
      flashAlgorithmService,
      scoringDegradationService,
      challengeRepository,
      events,
    } = dependencies;

    const certificationAssessment = await certificationAssessmentRepository.get(assessmentId);
    let certificationScoringCompletedEvent;

    if (CertificationVersion.isV3(certificationAssessment.version)) {
      certificationScoringCompletedEvent = await _handleV3CertificationScoring({
        certificationAssessment,
        locale,
        answerRepository,
        assessmentResultRepository,
        certificationAssessmentHistoryRepository,
        certificationChallengeForScoringRepository,
        certificationCourseRepository,
        competenceMarkRepository,
        flashAlgorithmConfigurationRepository,
        flashAlgorithmService,
        scoringConfigurationRepository,
        scoringCertificationService,
        scoringDegradationService,
        challengeRepository,
      });
    } else {
      certificationScoringCompletedEvent = await _handleV2CertificationScoring({
        certificationAssessment,
        assessmentResultRepository,
        certificationCourseRepository,
        competenceMarkRepository,
        scoringCertificationService,
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
  competenceMarkRepository,
  scoringCertificationService,
}) {
  const emitter = AssessmentResult.emitters.PIX_ALGO;

  try {
    const { certificationCourse, certificationAssessmentScore } =
      await scoringCertificationService.handleV2CertificationScoring({
        emitter,
        certificationAssessment,
        assessmentResultRepository,
        certificationCourseRepository,
        competenceMarkRepository,
        scoringCertificationService,
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
  answerRepository,
  assessmentResultRepository,
  certificationAssessmentHistoryRepository,
  certificationChallengeForScoringRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  flashAlgorithmConfigurationRepository,
  flashAlgorithmService,
  scoringConfigurationRepository,
  scoringCertificationService,
  scoringDegradationService,
  challengeRepository,
}) {
  const emitter = AssessmentResult.emitters.PIX_ALGO;
  const certificationCourse = await scoringCertificationService.handleV3CertificationScoring({
    certificationAssessment,
    emitter,
    locale,
    answerRepository,
    assessmentResultRepository,
    certificationAssessmentHistoryRepository,
    certificationChallengeForScoringRepository,
    certificationCourseRepository,
    competenceMarkRepository,
    flashAlgorithmConfigurationRepository,
    flashAlgorithmService,
    scoringDegradationService,
    scoringConfigurationRepository,
    challengeRepository,
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
