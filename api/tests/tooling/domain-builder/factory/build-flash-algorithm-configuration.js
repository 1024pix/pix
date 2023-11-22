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
    minimumEstimatedSuccessRateRanges,
    limitToOneQuestionPerTube,
    enablePassageByAllCompetences,
    variationPercent,
    doubleMeasuresUntil,
  };
};
