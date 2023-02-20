import buildCertificationCourse from './build-certification-course';
import buildIssueReportCategory from './build-issue-report-category';
import _ from 'lodash';
import databaseBuffer from '../database-buffer';

export default function buildCertificationIssueReport({
  id = databaseBuffer.getNextId(),
  certificationCourseId,
  categoryId,
  category,
  description = 'Une super description',
  subcategory = null,
  hasBeenAutomaticallyResolved = null,
  questionNumber = null,
  resolvedAt = null,
  resolution = null,
} = {}) {
  certificationCourseId = _.isUndefined(certificationCourseId) ? buildCertificationCourse().id : certificationCourseId;
  categoryId = _.isUndefined(categoryId) ? buildIssueReportCategory().id : categoryId;

  const values = {
    id,
    certificationCourseId,
    categoryId,
    category,
    description,
    subcategory,
    questionNumber,
    hasBeenAutomaticallyResolved,
    resolvedAt,
    resolution,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-issue-reports',
    values,
  });
}
