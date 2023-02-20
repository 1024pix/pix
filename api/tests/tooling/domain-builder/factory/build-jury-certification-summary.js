import JuryCertificationSummary from '../../../../lib/domain/read-models/JuryCertificationSummary';
import AssessmentResult from '../../../../lib/domain/models/AssessmentResult';

const buildJuryCertificationSummary = function ({
  id = 123,
  firstName = 'Jean',
  lastName = 'Bon',
  status = AssessmentResult.status.VALIDATED,
  pixScore = 100,
  createdAt = new Date('2020-01-01'),
  completedAt = new Date('2020-01-02'),
  abortReason = null,
  isPublished = true,
  isCancelled = false,
  isEndedBySupervisor = false,
  hasSeenEndTestScreen = true,
  complementaryCertificationTakenLabels = [],
  certificationIssueReports = [],
} = {}) {
  return new JuryCertificationSummary({
    id,
    firstName,
    lastName,
    status,
    pixScore,
    createdAt,
    completedAt,
    abortReason,
    isPublished,
    isCancelled,
    isEndedBySupervisor,
    hasSeenEndTestScreen,
    complementaryCertificationTakenLabels,
    certificationIssueReports,
  });
};

export default buildJuryCertificationSummary;
