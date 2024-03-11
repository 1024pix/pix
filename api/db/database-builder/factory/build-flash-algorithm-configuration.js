import { config } from '../../../src/shared/config.js';
import { databaseBuffer } from '../database-buffer.js';

const buildFlashAlgorithmConfiguration = function ({
  warmUpLength = null,
  forcedCompetences = [],
  maximumAssessmentLength = config.v3Certification.numberOfChallengesPerCourse,
  challengesBetweenSameCompetence = null,
  minimumEstimatedSuccessRateRanges = [],
  limitToOneQuestionPerTube = null,
  enablePassageByAllCompetences = false,
  doubleMeasuresUntil = null,
  variationPercent = null,
  variationPercentUntil = null,
  createdAt = new Date(),
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
    createdAt,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'flash-algorithm-configurations',
    values,
  });
};

export { buildFlashAlgorithmConfiguration };
