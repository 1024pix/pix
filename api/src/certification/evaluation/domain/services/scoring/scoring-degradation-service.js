/**
 * @typedef {import('../../models/AssessmentSimulator.js').AssessmentSimulator} AssessmentSimulator
 * @typedef {import('../../models/CalibratedChallenge.js').CalibratedChallenge} CalibratedChallenge
 * @typedef {import('../../models/FlashAssessmentAlgorithm.js').FlashAssessmentAlgorithm} FlashAssessmentAlgorithm
 * @typedef {import('../../../../../evaluation/domain/models/Answer.js').Answer} Answer
 * @typedef {import('../../../../shared/domain/models/FlashAssessmentAlgorithmConfiguration.js').FlashAssessmentAlgorithmConfiguration} FlashAssessmentAlgorithmConfiguration
 */

import { AnswerStatus } from '../../../../../shared/domain/models/AnswerStatus.js';
import { pickAnswerStatusService } from '../../../../shared/domain/services/pick-answer-status-service.js';
import { AssessmentSimulator } from '../../models/AssessmentSimulator.js';
import { AssessmentSimulatorSingleMeasureStrategy } from '../../models/AssessmentSimulatorSingleMeasureStrategy.js';
import pickChallengeService from '../pick-challenge-service.js';

const PROBABILITY_TO_PICK_THE_MOST_USEFUL_CHALLENGE_FOR_CANDIDATE_EVALUATION = 100;

/**
 * Downgrades the given capacity based on the flash assessment algorithm configuration and remaining challenges.
 *
 * @param {object} params
 * @param {FlashAssessmentAlgorithm} params.algorithm - The certification algorithm.
 * @param {number} params.capacity - The current capacity.
 * @param {CalibratedChallenge[]} params.allChallenges - All available challenges.
 * @param {Answer[]} params.allAnswers - All answers provided so far.
 * @param {FlashAssessmentAlgorithmConfiguration} params.flashAssessmentAlgorithmConfiguration - The flash assessment algorithm configuration.
 * @returns {number} The downgraded capacity.
 */
export const downgradeCapacity = ({
  algorithm,
  capacity,
  allChallenges,
  allAnswers,
  flashAssessmentAlgorithmConfiguration,
}) => {
  const numberOfUnansweredChallenges =
    flashAssessmentAlgorithmConfiguration.maximumAssessmentLength - allAnswers.length;

  const answerStatusArray = Array.from({ length: numberOfUnansweredChallenges }, () => AnswerStatus.SKIPPED);

  const pickAnswerStatus = pickAnswerStatusService.pickAnswerStatusFromArray(answerStatusArray);
  const challengePicker = pickChallengeService.getChallengePicker(
    PROBABILITY_TO_PICK_THE_MOST_USEFUL_CHALLENGE_FOR_CANDIDATE_EVALUATION,
  );

  const singleMeasureStrategy = new AssessmentSimulatorSingleMeasureStrategy({
    algorithm,
    challenges: allChallenges,
    pickChallenge: challengePicker,
    pickAnswerStatus,
    initialCapacity: capacity,
  });

  const simulator = new AssessmentSimulator({
    strategy: singleMeasureStrategy,
  });

  const result = simulator.run({ challengesAnswers: allAnswers });

  return result.at(-1).capacity;
};
