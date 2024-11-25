import { FlashAssessmentSuccessRateHandler } from '../../../../src/certification/flash-certification/domain/models/FlashAssessmentSuccessRateHandler.js';

export const buildFlashAssessmentAlgorithmSuccessRateHandlerFixed = ({
  startingChallengeIndex,
  endingChallengeIndex,
  value,
}) => {
  return FlashAssessmentSuccessRateHandler.create({ startingChallengeIndex, endingChallengeIndex, value });
};
