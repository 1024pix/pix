const JuryCertificationSummary = require('../../../../lib/domain/read-models/JuryCertificationSummary');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');

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
  isCourseCancelled = false,
  isEndedBySupervisor = false,
  hasSeenEndTestScreen = true,
  complementaryCertificationCourseResults = [],
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
    isCourseCancelled,
    isEndedBySupervisor,
    hasSeenEndTestScreen,
    complementaryCertificationCourseResults,
    certificationIssueReports,
  });
};

module.exports = buildJuryCertificationSummary;
