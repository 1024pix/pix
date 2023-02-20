import databaseBuffer from '../database-buffer';

export default function buildCertificationCourseLastAssessmentResult({
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
}
