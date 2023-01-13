const databaseBuffer = require('../database-buffer');

module.exports = function buildCertificationCourseLastAssessmentResult({
  certificationCourseId,
  lastAssessmentResultId,
} = {}) {
  const values = {
    certificationCourseId,
    lastAssessmentResultId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-courses-last-assessment-results',
    values,
  });
};
