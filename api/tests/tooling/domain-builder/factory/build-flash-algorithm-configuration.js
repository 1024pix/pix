import { FlashAssessmentAlgorithmConfiguration } from '../../../../src/certification/flash-certification/domain/models/FlashAssessmentAlgorithmConfiguration.js';
import { FlashAssessmentSuccessRateHandler } from '../../../../src/certification/flash-certification/domain/models/FlashAssessmentSuccessRateHandler.js';

export const buildFlashAlgorithmConfiguration = ({
  warmUpLength,
  forcedCompetences,
  maximumAssessmentLength,
  challengesBetweenSameCompetence,
  minimumEstimatedSuccessRateRanges = [],
  limitToOneQuestionPerTube,
  enablePassageByAllCompetences,
  doubleMeasuresUntil,
  variationPercent,
  variationPercentUntil,
  createdAt,
} = {}) => {
  return new FlashAssessmentAlgorithmConfiguration({
    warmUpLength,
    forcedCompetences,
    maximumAssessmentLength,
    challengesBetweenSameCompetence,
    minimumEstimatedSuccessRateRanges: minimumEstimatedSuccessRateRanges.map((successRateConfig) =>
      FlashAssessmentSuccessRateHandler.create(successRateConfig),
    ),
    limitToOneQuestionPerTube,
    enablePassageByAllCompetences,
    doubleMeasuresUntil,
    variationPercent,
    variationPercentUntil,
    createdAt,
  });
};
