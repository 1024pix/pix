import databaseBuffer from '../database-buffer';
import buildAnswer from './build-answer';

export default function buildFlashAssessmentResult({
  id = databaseBuffer.getNextId(),
  answerId,
  assessmentId,
  estimatedLevel = 2.64,
  errorRate = 0.391,
} = {}) {
  if (!answerId && !assessmentId) throw new Error('either `answerId` or `assessmentId` must be defined');
  if (!answerId) answerId = buildAnswer({ assessmentId }).id;
  return databaseBuffer.pushInsertable({
    tableName: 'flash-assessment-results',
    values: {
      id,
      answerId,
      estimatedLevel,
      errorRate,
      assessmentId,
    },
  });
}
