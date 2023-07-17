import { CertificationCourse } from '../../../../lib/domain/models/CertificationCourse.js';
import { buildAssessment } from './build-assessment.js';
import { CertificationIssueReport } from '../../../../lib/domain/models/CertificationIssueReport.js';
import { CertificationIssueReportCategory } from '../../../../lib/domain/models/CertificationIssueReportCategory.js';

function buildCertificationCourse({
  id = 123,
  firstName = 'Gandhi',
  lastName = 'Matmatah',
  birthplace = 'Perpignan',
  birthdate = '1985-01-20',
  sex = 'F',
  birthPostalCode = '75005',
  birthINSEECode = null,
  birthCountry = 'FRANCE',
  createdAt = new Date('2020-01-01'),
  completedAt = new Date('2020-02-01'),
  externalId = 'externalId',
  examinerComment = 'A cassé le clavier',
  hasSeenEndTestScreen = false,
  nbChallenges = 15,
  version = 1,
  isPublished = false,
  verificationCode = 'P-ABCD1234',
  assessment = buildAssessment({ certificationCourseId: this.id }),
  challenges = [],
  userId = 456,
  sessionId = 789,
  isCancelled = false,
  abortReason = null,
  complementaryCertificationCourses = [],
} = {}) {
  const certificationIssueReports = [];
  if (examinerComment && examinerComment !== '') {
    certificationIssueReports.push(
      new CertificationIssueReport({
        id: 159,
        certificationCourseId: id,
        category: CertificationIssueReportCategory.OTHER,
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
    birthPostalCode,
    birthINSEECode,
    birthCountry,
    sex,
    createdAt,
    completedAt,
    externalId,
    certificationIssueReports,
    hasSeenEndTestScreen,
    nbChallenges,
    version,
    isPublished,
    verificationCode,
    assessment,
    challenges,
    sessionId,
    userId,
    isCancelled,
    abortReason,
    complementaryCertificationCourses,
  });
}

buildCertificationCourse.unpersisted = function ({
  firstName = 'Gandhi',
  lastName = 'Matmatah',
  birthplace = 'Perpignan',
  birthdate = '1985-01-20',
  sex = 'F',
  birthPostalCode = '75005',
  birthINSEECode = null,
  birthCountry = 'FRANCE',
  createdAt = new Date('2020-01-01'),
  completedAt = new Date('2020-02-01'),
  externalId = 'externalId',
  hasSeenEndTestScreen = false,
  nbChallenges = 15,
  version = 1,
  isPublished = false,
  verificationCode = 'P-ABCD1234',
  assessment = buildAssessment({ certificationCourseId: this.id }),
  challenges = [],
  userId = 456,
  sessionId = 789,
  isCancelled = false,
  abortReason = null,
  complementaryCertificationCourses = [],
} = {}) {
  return new CertificationCourse({
    firstName,
    lastName,
    birthdate,
    birthplace,
    birthPostalCode,
    birthINSEECode,
    birthCountry,
    sex,
    createdAt,
    completedAt,
    externalId,
    certificationIssueReports: [],
    hasSeenEndTestScreen,
    nbChallenges,
    version,
    isPublished,
    verificationCode,
    assessment,
    challenges,
    sessionId,
    userId,
    isCancelled,
    abortReason,
    complementaryCertificationCourses,
  });
};

export { buildCertificationCourse };
