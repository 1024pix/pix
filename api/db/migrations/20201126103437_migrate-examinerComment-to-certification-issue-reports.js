import { CertificationIssueReportCategories } from '../../lib/domain/models/CertificationIssueReportCategory';
const CERTIFICATION_COURSES = 'certification-courses';
const CERTIFICATION_ISSUE_REPORTS = 'certification-issue-reports';

export const up = async (knex) => {
  const certificationCoursesWithExaminerComment = await knex(CERTIFICATION_COURSES)
    .select('id', 'examinerComment')
    .whereNotNull('examinerComment');

  const reportsToInsert = certificationCoursesWithExaminerComment.map(({ id, examinerComment }) => {
    return {
      certificationCourseId: id,
      description: examinerComment,
      category: CertificationIssueReportCategories.OTHER,
    };
  });

  return knex.batchInsert(CERTIFICATION_ISSUE_REPORTS, reportsToInsert);
};

export const down = async (knex) => {
  const certificationCoursesWithExaminerComment = await knex(CERTIFICATION_COURSES)
    .select('id')
    .whereNotNull('examinerComment');

  const idsToDelete = certificationCoursesWithExaminerComment.map((c) => c.id);

  return knex(CERTIFICATION_ISSUE_REPORTS).whereIn('certificationCourseId', idsToDelete).delete();
};
