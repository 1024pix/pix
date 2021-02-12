const buildCertificationCourse = require('./build-certification-course');
const _ = require('lodash');
const databaseBuffer = require('../database-buffer');
const { CertificationIssueReportCategories } = require('../../../lib/domain/models/CertificationIssueReportCategory');

module.exports = function buildCertificationIssueReport({
  id = databaseBuffer.getNextId(),
  certificationCourseId,
  category = CertificationIssueReportCategories.OTHER,
  description = 'Une super description',
  subcategory = null,
  questionNumber = null,
} = {}) {

  certificationCourseId = _.isUndefined(certificationCourseId)
    ? buildCertificationCourse().id
    : certificationCourseId;

  const values = {
    id,
    certificationCourseId,
    category,
    description,
    subcategory,
    questionNumber,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-issue-reports',
    values,
  });
};
