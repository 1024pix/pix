import { AnswerStatus, AssessmentSimulator } from '../../../../lib/domain/models/index.js';
import { pickAnswerStatusService } from '../../../../lib/domain/services/pick-answer-status-service.js';
import { AssessmentSimulatorSingleMeasureStrategy } from '../../../certification/flash-certification/domain/models/AssessmentSimulatorSingleMeasureStrategy.js';
import { pickChallengeService } from '../../../certification/flash-certification/domain/services/pick-challenge-service.js';

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
  const pickChallenge = pickChallengeService.chooseNextChallenge();

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
