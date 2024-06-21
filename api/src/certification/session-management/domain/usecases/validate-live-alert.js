/**
 * @typedef {import('./index.js').CertificationChallengeLiveAlertRepository} CertificationChallengeLiveAlertRepository
 *
 * @typedef {import('./index.js').AssessmentRepository} AssessmentRepository
 *
 * @typedef {import('./index.js').IssueReportCategoryRepository} IssueReportCategoryRepository
 *
 * @typedef {import('./index.js').CertificationIssueReportRepository} CertificationIssueReportRepository
 */

import { CertificationIssueReport, CertificationIssueReportCategory } from '../../../../../lib/domain/models/index.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';

/**
 * @param {Object} params
 * @param {number} params.userId,
 * @param {number} params.sessionId,
 * @param {string} params.subcategory,
 * @param {CertificationChallengeLiveAlertRepository} params.certificationChallengeLiveAlertRepository
 * @param {AssessmentRepository} params.assessmentRepository
 * @param {IssueReportCategoryRepository} params.issueReportCategoryRepository
 * @param {CertificationIssueReportRepository} params.certificationIssueReportRepository
 */
export const validateLiveAlert = async ({
  userId,
  sessionId,
  subcategory,
  certificationChallengeLiveAlertRepository,
  assessmentRepository,
  issueReportCategoryRepository,
  certificationIssueReportRepository,
}) => {
  const certificationChallengeLiveAlert =
    await certificationChallengeLiveAlertRepository.getOngoingBySessionIdAndUserId({
      sessionId,
      userId,
    });

  if (!certificationChallengeLiveAlert) {
    throw new NotFoundError('There is no ongoing alert for this user');
  }

  const assessment = await assessmentRepository.get(certificationChallengeLiveAlert.assessmentId);

  const { certificationCourseId } = assessment;

  certificationChallengeLiveAlert.validate();
  const issueReportCategory = await issueReportCategoryRepository.get({ name: subcategory });
  const certificationIssueReport = CertificationIssueReport.create({
    certificationCourseId,
    questionNumber: certificationChallengeLiveAlert.questionNumber,
    category: CertificationIssueReportCategory.IN_CHALLENGE,
    subcategory,
    categoryId: issueReportCategory.id,
    liveAlertId: certificationChallengeLiveAlert.id,
  });

  const ISSUE_REPORT_RESOLUTION =
    'Le signalement a été validé par le surveillant pendant la session. Une nouvelle question a été proposée au candidat';
  certificationIssueReport.resolveAutomatically(ISSUE_REPORT_RESOLUTION);

  await certificationIssueReportRepository.save({ certificationIssueReport });

  await certificationChallengeLiveAlertRepository.save({
    certificationChallengeLiveAlert,
  });
};
