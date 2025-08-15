/**
 * @typedef {import('./index.js').CertificationRescoringRepository} CertificationRescoringRepository
 * @typedef {import('./index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('./index.js').CertificationAssessmentRepository} CertificationAssessmentRepository
 */
import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { PromiseUtils } from '../../../../shared/infrastructure/utils/promise-utils.js';
import * as injectedCertificationAssessmentRepository from '../../../shared/infrastructure/repositories/certification-assessment-repository.js';
import * as injectedCertificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import * as injectedCertificationRescoringRepository from '../../infrastructure/repositories/certification-rescoring-repository.js';
import { certificationIssueReportRepository as injectedCertificationIssueReportRepository } from '../../infrastructure/repositories/index.js';
import { challengeRepository as injectedChallengeRepository } from '../../infrastructure/repositories/index.js';
import { CertificationJuryDone } from '../events/CertificationJuryDone.js';
import { CertificationAssessment } from '../models/CertificationAssessment.js';
import { CertificationIssueReportResolutionAttempt } from '../models/CertificationIssueReportResolutionAttempt.js';
import { CertificationIssueReportResolutionStrategies } from '../models/CertificationIssueReportResolutionStrategies.js';

/**
 * @param {Object} params
 * @param {CertificationRescoringRepository} params.certificationRescoringRepository
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {CertificationAssessmentRepository} params.certificationAssessmentRepository
 */
export async function processAutoJury({
  sessionId,
  certificationIssueReportRepository = injectedCertificationIssueReportRepository,
  certificationAssessmentRepository = injectedCertificationAssessmentRepository,
  certificationCourseRepository = injectedCertificationCourseRepository,
  challengeRepository = injectedChallengeRepository,
  certificationRescoringRepository = injectedCertificationRescoringRepository,
} = {}) {
  const certificationCourses = await certificationCourseRepository.findCertificationCoursesBySessionId({
    sessionId,
  });

  for (const certificationCourse of certificationCourses) {
    if (certificationCourse.isV3()) {
      await _handleAutoJuryV3({
        certificationCourse,
        certificationAssessmentRepository,
        certificationRescoringRepository,
      });
    }

    if (certificationCourse.isV2()) {
      await _handleAutoJuryV2({
        certificationCourse,
        certificationIssueReportRepository,
        challengeRepository,
        certificationAssessmentRepository,
        certificationRescoringRepository,
      });
    }
  }
}

/**
 * @param {Object} params
 * @param {CertificationRescoringRepository} params.certificationRescoringRepository
 * @param {CertificationAssessmentRepository} params.certificationAssessmentRepository
 */
async function _handleAutoJuryV2({
  certificationCourse,
  certificationIssueReportRepository,
  challengeRepository,
  certificationAssessmentRepository,
  certificationRescoringRepository,
}) {
  const resolutionStrategies = new CertificationIssueReportResolutionStrategies({
    certificationIssueReportRepository,
    challengeRepository,
  });

  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
    certificationCourseId: certificationCourse.getId(),
  });

  const hasAutoCompleteAnEffectOnScoring = await _autoCompleteUnfinishedTest({
    certificationCourse,
    certificationAssessment,
    certificationAssessmentRepository,
  });

  const hasAutoResolutionAnEffectOnScoring = await _autoResolveCertificationIssueReport({
    certificationCourse,
    certificationAssessment,
    certificationIssueReportRepository,
    certificationAssessmentRepository,
    resolutionStrategies,
  });

  if (hasAutoResolutionAnEffectOnScoring || hasAutoCompleteAnEffectOnScoring) {
    const certificationJuryDoneEvent = new CertificationJuryDone({
      certificationCourseId: certificationCourse.getId(),
    });

    await certificationRescoringRepository.rescoreV2Certification({
      event: certificationJuryDoneEvent,
    });
  }
}

const _handleAutoJuryV3 = withTransaction(
  /**
   * @param {Object} params
   * @param {CertificationRescoringRepository} params.certificationRescoringRepository
   * @param {CertificationAssessmentRepository} params.certificationAssessmentRepository
   */
  async ({ certificationCourse, certificationAssessmentRepository, certificationRescoringRepository }) => {
    const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
      certificationCourseId: certificationCourse.getId(),
    });
    if (_v3CertificationShouldBeScored(certificationAssessment)) {
      const certificationJuryDoneEvent = new CertificationJuryDone({
        certificationCourseId: certificationCourse.getId(),
      });

      await certificationRescoringRepository.rescoreV3Certification({
        event: certificationJuryDoneEvent,
      });
    }

    certificationAssessment.endDueToFinalization();

    await certificationAssessmentRepository.save(certificationAssessment);
  },
);

function _v3CertificationShouldBeScored(certificationAssessment) {
  return certificationAssessment.state !== CertificationAssessment.states.COMPLETED;
}

async function _autoCompleteUnfinishedTest({
  certificationCourse,
  certificationAssessment,
  certificationAssessmentRepository,
}) {
  if (certificationCourse.isCompleted()) {
    return false;
  }

  if (certificationCourse.isAbortReasonCandidateRelated()) {
    certificationAssessment.skipUnansweredChallenges();
  }

  if (certificationCourse.isAbortReasonTechnical()) {
    certificationAssessment.neutralizeUnansweredChallenges();
  }

  certificationAssessment.endDueToFinalization();

  await certificationAssessmentRepository.save(certificationAssessment);

  return true;
}

async function _autoResolveCertificationIssueReport({
  certificationCourse,
  certificationAssessment,
  certificationIssueReportRepository,
  certificationAssessmentRepository,
  resolutionStrategies,
}) {
  const certificationIssueReports = await certificationIssueReportRepository.findByCertificationCourseId({
    certificationCourseId: certificationCourse.getId(),
  });

  if (certificationIssueReports.length === 0) {
    return null;
  }

  const resolutionAttempts = await PromiseUtils.mapSeries(
    certificationIssueReports,
    async (certificationIssueReport) => {
      try {
        return await resolutionStrategies.resolve({ certificationIssueReport, certificationAssessment });
      } catch (e) {
        logger.error(e);
        return CertificationIssueReportResolutionAttempt.unresolved();
      }
    },
  );

  if (resolutionAttempts.some((attempt) => attempt.isResolvedWithEffect())) {
    await certificationAssessmentRepository.save(certificationAssessment);
    return true;
  }

  return false;
}
