const databaseBuffer = require('../database-buffer');
const buildBadge = require('./build-badge');
const buildCertificationCourse = require('./build-certification-course');
const _ = require('lodash');

module.exports = function buildPartnerCertification({
  certificationCourseId,
  partnerKey,
  acquired = true,
}) {
  certificationCourseId = _.isUndefined(certificationCourseId) ? buildCertificationCourse().id : certificationCourseId;
  partnerKey = partnerKey ? partnerKey : buildBadge().key;
  return databaseBuffer.objectsToInsert.push({
    tableName: 'partner-certifications', values: { certificationCourseId, partnerKey, acquired },
  });
};
