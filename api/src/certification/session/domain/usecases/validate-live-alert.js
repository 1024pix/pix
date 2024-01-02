/**
 * @typedef {import('../../../shared/domain/usecases/index.js').CertificationChallengeLiveAlertRepository} CertificationChallengeLiveAlertRepository
 *
 *
 * @typedef {import('../../../shared/domain/usecases/index.js').AssessmentRepository} AssessmentRepository
 *
 * @typedef {import('../../../shared/domain/usecases/index.js').IssueReportCategoryRepository} IssueReportCategoryRepository
 *
 *
 * @typedef {import('../../../shared/domain/usecases/index.js').CertificationIssueReportRepository} CertificationIssueReportRepository
 */

import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { CertificationIssueReport, CertificationIssueReportCategory } from '../../../../../lib/domain/models/index.js';

/**
 * @param {Object} params
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

  await certificationIssueReportRepository.save(certificationIssueReport);

  await certificationChallengeLiveAlertRepository.save({
    certificationChallengeLiveAlert,
  });
};
