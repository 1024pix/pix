const databaseBuffer = require('../database-buffer');
const buildCertificationCourse = require('./build-certification-course');
const _ = require('lodash');

module.exports = function buildPartnerCertification({
  certificationCourseId,
  partnerKey,
  temporaryPartnerKey,
  acquired = true,
}) {
  certificationCourseId = _.isUndefined(certificationCourseId) ? buildCertificationCourse().id : certificationCourseId;
  return databaseBuffer.objectsToInsert.push({
    tableName: 'partner-certifications',
    values: { certificationCourseId, partnerKey, temporaryPartnerKey, acquired },
  });
};
