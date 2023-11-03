import { FlashAssessmentSuccessRateHandler } from '../../../../src/certification/flash-certification/domain/model/FlashAssessmentSuccessRateHandler.js';

export const buildFlashAssessmentAlgorithmSuccessRateHandlerLinear = ({
  startingChallengeIndex,
  endingChallengeIndex,
  startingValue,
  endingValue,
}) => {
  return FlashAssessmentSuccessRateHandler.createLinear({
    startingChallengeIndex,
    endingChallengeIndex,
    startingValue,
    endingValue,
  });
};

export const buildFlashAssessmentAlgorithmSuccessRateHandlerFixed = ({
  startingChallengeIndex,
  endingChallengeIndex,
  value,
}) => {
  return FlashAssessmentSuccessRateHandler.createFixed({ startingChallengeIndex, endingChallengeIndex, value });
};
