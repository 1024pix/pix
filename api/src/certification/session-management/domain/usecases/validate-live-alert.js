/**
 * @typedef {import('./index.js').CertificationChallengeLiveAlertRepository} CertificationChallengeLiveAlertRepository
 * @typedef {import('./index.js').AssessmentRepository} AssessmentRepository
 * @typedef {import('./index.js').IssueReportCategoryRepository} IssueReportCategoryRepository
 * @typedef {import('./index.js').CertificationIssueReportRepository} CertificationIssueReportRepository
 */

import { ChallengeAlreadyAnsweredError, NotFoundError } from '../../../../shared/domain/errors.js';
import { CertificationIssueReport } from '../../../shared/domain/models/CertificationIssueReport.js';
import { CertificationIssueReportCategory } from '../../../shared/domain/models/CertificationIssueReportCategory.js';

/**
 * @param {object} params
 * @param {CertificationChallengeLiveAlertRepository} params.certificationChallengeLiveAlertRepository
 * @param {AssessmentRepository} params.assessmentRepository
 * @param {IssueReportCategoryRepository} params.issueReportCategoryRepository
 * @param {CertificationIssueReportRepository} params.certificationIssueReportRepository
 */
export async function validateLiveAlert({
  userId,
  sessionId,
  subcategory,
  certificationChallengeLiveAlertRepository,
  assessmentRepository,
  issueReportCategoryRepository,
  certificationIssueReportRepository,
  answerRepository,
}) {
  const certificationChallengeLiveAlert =
    await certificationChallengeLiveAlertRepository.getOngoingBySessionIdAndUserId({
      sessionId,
      userId,
    });

  if (!certificationChallengeLiveAlert) {
    throw new NotFoundError('There is no ongoing alert for this user');
  }

  await _dismissLiveAlertForAnsweredChallenge({
    certificationChallengeLiveAlert,
    certificationChallengeLiveAlertRepository,
    answerRepository,
  });

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
}

async function _dismissLiveAlertForAnsweredChallenge({
  certificationChallengeLiveAlert,
  certificationChallengeLiveAlertRepository,
  answerRepository,
}) {
  const candidateAnswers = await answerRepository.findByAssessment(certificationChallengeLiveAlert.assessmentId);

  const answeredAlertedChallenge = candidateAnswers.find(
    (answer) => answer.challengeId === certificationChallengeLiveAlert.challengeId,
  );

  if (answeredAlertedChallenge) {
    certificationChallengeLiveAlert.dismiss();

    await certificationChallengeLiveAlertRepository.save({
      certificationChallengeLiveAlert,
    });

    throw new ChallengeAlreadyAnsweredError();
  }
}
