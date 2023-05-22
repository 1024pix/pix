import { databaseBuffer } from '../database-buffer.js';

const buildCertificationCourseLastAssessmentResult = function ({ certificationCourseId, lastAssessmentResultId } = {}) {
  const values = {
    certificationCourseId,
    lastAssessmentResultId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-courses-last-assessment-results',
    values,
  });
};

export { buildCertificationCourseLastAssessmentResult };
