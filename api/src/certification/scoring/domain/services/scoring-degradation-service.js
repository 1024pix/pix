import { pickChallengeService } from '../../../../evaluation/domain/services/pick-challenge-service.js';
import { AnswerStatus, AssessmentSimulator } from '../../../../shared/domain/models/index.js';
import { AssessmentSimulatorSingleMeasureStrategy } from '../../../flash-certification/domain/models/AssessmentSimulatorSingleMeasureStrategy.js';
import { pickAnswerStatusService } from '../../../shared/domain/services/pick-answer-status-service.js';

const PROBABILITY_TO_PICK_THE_MOST_USEFUL_CHALLENGE_FOR_CANDIDATE_EVALUATION = 100;

const downgradeCapacity = ({
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
  const pickChallenge = pickChallengeService.chooseNextChallenge(
    PROBABILITY_TO_PICK_THE_MOST_USEFUL_CHALLENGE_FOR_CANDIDATE_EVALUATION,
  );

  const singleMeasureStrategy = new AssessmentSimulatorSingleMeasureStrategy({
    algorithm,
    challenges: allChallenges,
    pickChallenge,
    pickAnswerStatus,
    initialCapacity: capacity,
  });

  const getStrategy = () => singleMeasureStrategy;

  const simulator = new AssessmentSimulator({
    getStrategy,
  });

  const result = simulator.run({ challengesAnswers: allAnswers });

  return result.at(-1).capacity;
};

export const scoringDegradationService = { downgradeCapacity };
