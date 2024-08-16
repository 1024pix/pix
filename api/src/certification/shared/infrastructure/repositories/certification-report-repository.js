import { knex } from '../../../../../db/knex-database-connection.js';
import { Assessment } from '../../../../school/domain/models/Assessment.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { Challenge } from '../../../../shared/domain/models/index.js';
import { ComplementaryCertificationCourse } from '../../../session-management/domain/models/ComplementaryCertificationCourse.js';
import { CertificationCourseUpdateError } from '../../domain/errors.js';
import { CertificationCourse } from '../../domain/models/CertificationCourse.js';
import { CertificationIssueReport } from '../../domain/models/CertificationIssueReport.js';
import { CertificationReport } from '../../domain/models/CertificationReport.js';

const ASSESSMENTS_TABLE = 'assessments';
const CERTIFICATION_COURSES_TABLE = 'certification-courses';
const CERTIFICATION_CHALLENGES_TABLE = 'certification-challenges';
const CERTIFICATION_ISSUE_REPORTS_TABLE = 'certification-issue-reports';
const COMPLEMENTARY_CERTIFICATION_COURSES_TABLE = 'complementary-certification-courses';

export const findBySessionId = async ({ sessionId }) => {
  const knexConnection = DomainTransaction.getConnection();
  const certificationCourses = await knexConnection(CERTIFICATION_COURSES_TABLE)
    .where({ sessionId })
    .orderByRaw('LOWER("lastName") ASC, LOWER("firstName") ASC');

  const certificationCoursesIds = certificationCourses.map(({ id }) => id);

  if (!certificationCourses.length) {
    return [];
  }

  const assessments = await knexConnection(ASSESSMENTS_TABLE).whereIn('certificationCourseId', certificationCoursesIds);
  const certificationChallenges = await knexConnection(CERTIFICATION_CHALLENGES_TABLE).whereIn(
    'courseId',
    certificationCoursesIds,
  );
  const certificationIssueReports = await knexConnection(CERTIFICATION_ISSUE_REPORTS_TABLE).whereIn(
    'certificationCourseId',
    certificationCoursesIds,
  );
  const complementaryCertificationCourses = await knexConnection(COMPLEMENTARY_CERTIFICATION_COURSES_TABLE).whereIn(
    'certificationCourseId',
    certificationCoursesIds,
  );

  return toDomain(
    assessments,
    certificationCourses,
    certificationChallenges,
    certificationIssueReports,
    complementaryCertificationCourses,
  ).map(CertificationReport.fromCertificationCourse);
};

export const finalizeAll = async ({ certificationReports }) => {
  try {
    await knex.transaction(async (transaction) => {
      await Promise.all(certificationReports.map((certificationReport) => finalize(certificationReport, transaction)));
    });
  } catch (err) {
    throw new CertificationCourseUpdateError('An error occurred while finalizing the session');
  }
};

const finalize = async (certificationReport, transaction) => {
  return transaction(CERTIFICATION_COURSES_TABLE).where({ id: certificationReport.certificationCourseId }).update({
    hasSeenEndTestScreen: certificationReport.hasSeenEndTestScreen,
    updatedAt: new Date(),
  });
};

const toDomain = (
  assessments,
  certificationCourses,
  certificationChallenges,
  certificationIssueReports,
  complementaryCertificationCourses,
) =>
  certificationCourses.map(
    (certificationCourse) =>
      new CertificationCourse({
        ...certificationCourse,
        assessment: new Assessment(
          assessments.find(({ certificationCourseId }) => certificationCourseId === certificationCourse.id),
        ),
        challenges: certificationChallenges
          .filter(({ courseId }) => courseId === certificationCourse.id)
          .map((challenge) => new Challenge(challenge)),
        certificationIssueReports: certificationIssueReports
          .filter(({ certificationCourseId }) => certificationCourseId === certificationCourse.id)
          .map((certificationIssueReport) => new CertificationIssueReport(certificationIssueReport)),
        complementaryCertificationCourses: complementaryCertificationCourses
          .filter(({ certificationCourseId }) => certificationCourseId === certificationCourse.id)
          .map(
            (complementaryCertificationCourse) =>
              new ComplementaryCertificationCourse(complementaryCertificationCourse),
          ),
      }),
  );
