import { CertificationIssueReportCategory } from '../../src/certification/shared/domain/models/CertificationIssueReportCategory.js';

const CERTIFICATION_COURSES = 'certification-courses';
const CERTIFICATION_ISSUE_REPORTS = 'certification-issue-reports';

const up = async function (knex) {
  const certificationCoursesWithExaminerComment = await knex(CERTIFICATION_COURSES)
    .select('id', 'examinerComment')
    .whereNotNull('examinerComment');

  const reportsToInsert = certificationCoursesWithExaminerComment.map(({ id, examinerComment }) => {
    return {
      certificationCourseId: id,
      description: examinerComment,
      category: CertificationIssueReportCategory.OTHER,
    };
  });

  return knex.batchInsert(CERTIFICATION_ISSUE_REPORTS, reportsToInsert);
};

const down = async function (knex) {
  const certificationCoursesWithExaminerComment = await knex(CERTIFICATION_COURSES)
    .select('id')
    .whereNotNull('examinerComment');

  const idsToDelete = certificationCoursesWithExaminerComment.map((c) => c.id);

  return knex(CERTIFICATION_ISSUE_REPORTS).whereIn('certificationCourseId', idsToDelete).delete();
};

export { up, down };
