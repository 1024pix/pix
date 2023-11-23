import { FlashAssessmentSuccessRateHandler } from '../../../../src/certification/flash-certification/domain/model/FlashAssessmentSuccessRateHandler.js';

export const buildFlashAlgorithmConfiguration = ({
  warmUpLength,
  forcedCompetences = [],
  maximumAssessmentLength,
  challengesBetweenSameCompetence,
  minimumEstimatedSuccessRateRanges = [],
  limitToOneQuestionPerTube,
  enablePassageByAllCompetences,
  variationPercent,
  doubleMeasuresUntil,
} = {}) => {
  return {
    warmUpLength,
    forcedCompetences,
    maximumAssessmentLength,
    challengesBetweenSameCompetence,
    minimumEstimatedSuccessRateRanges: minimumEstimatedSuccessRateRanges.map((successRateConfig) =>
      FlashAssessmentSuccessRateHandler.create(successRateConfig),
    ),
    limitToOneQuestionPerTube,
    enablePassageByAllCompetences,
    variationPercent,
    doubleMeasuresUntil,
  };
};
