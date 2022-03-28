const databaseBuffer = require('../database-buffer');
const buildCertificationCourse = require('./build-certification-course');
const _ = require('lodash');

module.exports = function buildComplementaryCertificationCourseResult({
  certificationCourseId,
  partnerKey,
  temporaryPartnerKey,
  acquired = true,
}) {
  certificationCourseId = _.isUndefined(certificationCourseId) ? buildCertificationCourse().id : certificationCourseId;
  return databaseBuffer.objectsToInsert.push({
    tableName: 'complementary-certification-course-results',
    values: { certificationCourseId, partnerKey, temporaryPartnerKey, acquired },
  });
};
