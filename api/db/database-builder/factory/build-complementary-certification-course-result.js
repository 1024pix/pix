const databaseBuffer = require('../database-buffer');
const buildComplementaryCertificationCourse = require('./build-complementary-certification-course');
const buildComplementaryCertification = require('./build-complementary-certification');
const buildCertificationCourse = require('./build-certification-course');
const _ = require('lodash');

module.exports = function buildComplementaryCertificationCourseResult({
  complementaryCertificationCourseId,
  partnerKey,
  temporaryPartnerKey,
  acquired = true,
}) {
  complementaryCertificationCourseId = _.isUndefined(complementaryCertificationCourseId)
    ? _buildComplementaryCertificationCourse().id
    : complementaryCertificationCourseId;
  return databaseBuffer.objectsToInsert.push({
    tableName: 'complementary-certification-course-results',
    values: { complementaryCertificationCourseId, partnerKey, temporaryPartnerKey, acquired },
  });
};

function _buildComplementaryCertificationCourse() {
  const { id: complementaryCertificationId } = buildComplementaryCertification();
  const { id: certificationCourseId } = buildCertificationCourse();
  return buildComplementaryCertificationCourse({
    complementaryCertificationId,
    certificationCourseId,
  });
}
