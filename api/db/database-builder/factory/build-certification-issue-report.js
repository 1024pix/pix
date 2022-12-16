const buildCertificationCourse = require('./build-certification-course');
const buildIssueReportCategory = require('./build-issue-report-category');
const _ = require('lodash');
const databaseBuffer = require('../database-buffer');

module.exports = function buildCertificationIssueReport({
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
};
