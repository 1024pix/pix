import { FlashAssessmentAlgorithmConfiguration } from '../../../../../../src/certification/shared/domain/models/FlashAssessmentAlgorithmConfiguration.js';

export const buildFlashAssessmentAlgorithmConfiguration = function ({
  maximumAssessmentLength = 1,
  challengesBetweenSameCompetence = 1,
  limitToOneQuestionPerTube = false,
  enablePassageByAllCompetences = false,
  variationPercent = 0.5,
  defaultCandidateCapacity = 1,
  defaultProbabilityToPickChallenge = 0.5,
} = {}) {
  return new FlashAssessmentAlgorithmConfiguration({
    maximumAssessmentLength,
    challengesBetweenSameCompetence,
    limitToOneQuestionPerTube,
    enablePassageByAllCompetences,
    variationPercent,
    defaultCandidateCapacity,
    defaultProbabilityToPickChallenge,
  });
};
