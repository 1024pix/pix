import { databaseBuffer } from '../database-buffer.ts';

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
