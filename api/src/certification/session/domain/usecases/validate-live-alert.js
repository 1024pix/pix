/**
 * @typedef {import ('../../../session/infrastructure/repositories/certification-challenge-live-alert-repository.js')} certificationChallengeLiveAlertRepository
 * @typedef {import ('../../../../../src/shared/infrastructure/repositories/assessment-repository.js')} assessmentRepository
 * @typedef {import ('../../../shared/infrastructure/repositories/issue-report-category-repository.js')} issueReportCategoryRepository
 * @typedef {import ('../../../shared/infrastructure/repositories/certification-issue-report-repository.js')} certificationIssueReportRepository
 */

import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { CertificationIssueReport, CertificationIssueReportCategory } from '../../../../../lib/domain/models/index.js';

/**
 * @param {Object} deps
 * @param {certificationChallengeLiveAlertRepository} deps.certificationChallengeLiveAlertRepository
 * @param {assessmentRepository} deps.assessmentRepository
 * @param {issueReportCategoryRepository} deps.issueReportCategoryRepository
 * @param {certificationIssueReportRepository} deps.certificationIssueReportRepository
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
  });

  await certificationIssueReportRepository.save(certificationIssueReport);

  await certificationChallengeLiveAlertRepository.save({
    certificationChallengeLiveAlert,
  });
};
