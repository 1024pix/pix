import { databaseBuffer } from '../database-buffer.js';

const buildFlashAlgorithmConfiguration = function ({
  warmUpLength = null,
  forcedCompetences = [],
  maximumAssessmentLength = null,
  challengesBetweenSameCompetence = null,
  minimumEstimatedSuccessRateRanges = [],
  limitToOneQuestionPerTube = null,
  enablePassageByAllCompetences = false,
  doubleMeasuresUntil = null,
  variationPercent = null,
  variationPercentUntil = null,
} = {}) {
  const values = {
    warmUpLength,
    maximumAssessmentLength,
    challengesBetweenSameCompetence,
    forcedCompetences: JSON.stringify(forcedCompetences),
    minimumEstimatedSuccessRateRanges: JSON.stringify(minimumEstimatedSuccessRateRanges),
    limitToOneQuestionPerTube,
    enablePassageByAllCompetences,
    doubleMeasuresUntil,
    variationPercent,
    variationPercentUntil,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'flash-algorithm-configurations',
    values,
  });
};

export { buildFlashAlgorithmConfiguration };
