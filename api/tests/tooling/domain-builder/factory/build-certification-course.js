const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');
const buildAssessment = require('./build-assessment');
const CertificationIssueReport = require('../../../../lib/domain/models/CertificationIssueReport');
const { CertificationIssueReportCategories } = require('../../../../lib/domain/models/CertificationIssueReportCategory');
module.exports = function buildCertificationCourse({
  id = 123,
  firstName = 'Gandhi',
  lastName = 'Matmatah',
  birthplace = 'Perpignan',
  birthdate = '1985-01-20',
  createdAt = new Date('2020-01-01'),
  completedAt = new Date('2020-02-01'),
  externalId = 'externalId',
  examinerComment = 'A cassé le clavier',
  hasSeenEndTestScreen = false,
  nbChallenges = 15,
  isV2Certification = false,
  isPublished = false,
  verificationCode = 'P-ABCD1234',
  acquiredPartnerCertifications = [],
  assessment = buildAssessment({ certificationCourseId: this.id }),
  challenges = [],
  userId = 456,
  sessionId = 789,
  isCancelled = false,
} = {}) {

  const certificationIssueReports = [];
  if (examinerComment && examinerComment !== '') {
    certificationIssueReports.push(
      new CertificationIssueReport({
        id: 159,
        certificationCourseId: id,
        category: CertificationIssueReportCategories.OTHER,
        description: examinerComment,
      }),
    );
  }

  return new CertificationCourse({
    id,
    firstName,
    lastName,
    birthdate,
    birthplace,
    createdAt,
    completedAt,
    externalId,
    certificationIssueReports,
    hasSeenEndTestScreen,
    nbChallenges,
    isV2Certification,
    isPublished,
    verificationCode,
    acquiredPartnerCertifications,
    assessment,
    challenges,
    sessionId,
    userId,
    isCancelled,
  });
};
