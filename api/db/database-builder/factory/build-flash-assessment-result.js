const databaseBuffer = require('../database-buffer');
const buildAssessment = require('./build-assessment');

module.exports = function buildFlashAssessmentResult({
  id = databaseBuffer.getNextId(),
  assessmentId,
  estimatedLevel = 2.64,
  errorRate = 0.391,
} = {}) {
  if (!assessmentId) assessmentId = buildAssessment({ method: 'FLASH' }).id;
  return databaseBuffer.pushInsertable({
    tableName: 'flash-assessment-results',
    values: {
      id,
      assessmentId,
      estimatedLevel,
      errorRate,
    },
  });
};
