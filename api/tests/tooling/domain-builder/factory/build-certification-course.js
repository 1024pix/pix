import { AlgorithmEngineVersion } from '../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { CertificationCourse } from '../../../../src/certification/shared/domain/models/CertificationCourse.js';
import { CertificationIssueReport } from '../../../../src/certification/shared/domain/models/CertificationIssueReport.js';
import { CertificationIssueReportCategory } from '../../../../src/certification/shared/domain/models/CertificationIssueReportCategory.js';
import { Frameworks } from '../../../../src/certification/shared/domain/models/Frameworks.js';
import { buildAssessment } from './build-assessment.js';

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
  nbChallenges = 15,
  version = AlgorithmEngineVersion.V1,
  isPublished = false,
  verificationCode = 'P-ABCD1234',
  assessment = buildAssessment({ certificationCourseId: this.id }),
  userId = 456,
  sessionId = 789,
  isRejectedForFraud = false,
  abortReason = null,
  complementaryCertificationCourse = null,
  maxReachableLevelOnCertificationDate = 7,
  numberOfChallenges,
  isAdjustedForAccessibility = false,
  lang,
  framework = Frameworks.CORE,
  versionId = 20,
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

  const finalNumberOfChallenges =
    numberOfChallenges !== undefined ? numberOfChallenges : AlgorithmEngineVersion.isV3(version) ? 20 : undefined;

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
    nbChallenges,
    version,
    isPublished,
    verificationCode,
    assessment,
    sessionId,
    userId,
    isRejectedForFraud,
    abortReason,
    complementaryCertificationCourse,
    maxReachableLevelOnCertificationDate,
    numberOfChallenges: finalNumberOfChallenges,
    isAdjustedForAccessibility,
    lang,
    framework,
    versionId,
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
  nbChallenges = 15,
  version = 1,
  isPublished = false,
  verificationCode = 'P-ABCD1234',
  assessment = buildAssessment({ certificationCourseId: this.id }),
  userId = 456,
  sessionId = 789,
  isRejectedForFraud = false,
  abortReason = null,
  complementaryCertificationCourse = null,
  maxReachableLevelOnCertificationDate = 7,
  lang,
  versionId = 123,
  candidateId = 456,
  framework = Frameworks.CORE,
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
    nbChallenges,
    version,
    isPublished,
    verificationCode,
    assessment,
    sessionId,
    userId,
    isRejectedForFraud,
    abortReason,
    complementaryCertificationCourse,
    maxReachableLevelOnCertificationDate,
    lang,
    versionId,
    candidateId,
    framework,
  });
};

export { buildCertificationCourse };
