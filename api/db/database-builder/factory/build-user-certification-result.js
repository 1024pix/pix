import { databaseBuffer } from '../database-buffer.ts';

export function buildUserCertificationResult({
  certificationResultId,
  userId,
  sessionId = null,
  certificationCourseId = null,
} = {}) {
  const values = {
    certificationResultId,
    userId,
    sessionId,
    certificationCourseId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'user_certification_results',
    values,
  });
}
