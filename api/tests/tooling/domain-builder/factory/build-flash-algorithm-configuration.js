import { FlashAssessmentSuccessRateHandler } from '../../../../src/certification/flash-certification/domain/model/FlashAssessmentSuccessRateHandler.js';
import { FlashAssessmentAlgorithmConfiguration } from '../../../../src/certification/flash-certification/domain/model/FlashAssessmentAlgorithmConfiguration.js';

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
  });
};
