import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { CertificationIssueReport, CertificationIssueReportCategory } from '../../../../../lib/domain/models/index.js';

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

  certificationChallengeLiveAlert.validate();

  await certificationChallengeLiveAlertRepository.save({
    certificationChallengeLiveAlert,
  });
};
