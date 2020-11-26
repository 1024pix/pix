const faker = require('faker');
const buildCertificationCourse = require('./build-certification-course');
const _ = require('lodash');
const databaseBuffer = require('../database-buffer');
const { CertificationIssueReportCategories } = require('../../../../lib/domain/models/CertificationIssueReportCategory');

module.exports = function buildCertificationIssueReport({
  id,
  certificationCourseId,
  categoryId = CertificationIssueReportCategories.OTHER,
  description = faker.lorem.sentence(),
} = {}) {

  certificationCourseId = _.isUndefined(certificationCourseId)
    ? buildCertificationCourse().id
    : certificationCourseId;

  const values = {
    id,
    certificationCourseId,
    categoryId,
    description,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-issue-reports',
    values,
  });
};
