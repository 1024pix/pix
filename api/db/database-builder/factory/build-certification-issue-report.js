import { buildCertificationCourse } from './build-certification-course.js';
import { buildIssueReportCategory } from './build-issue-report-category.js';
import _ from 'lodash';
import { databaseBuffer } from '../database-buffer.js';

const buildCertificationIssueReport = function ({
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
  liveAlertId = null,
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
    liveAlertId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-issue-reports',
    values,
  });
};

export { buildCertificationIssueReport };
