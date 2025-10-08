import { Readable } from 'node:stream';

import _ from 'lodash';

import { random } from '../../../shared/infrastructure/utils/random.js';
import { pickAnswerStatusService } from '../../shared/domain/services/pick-answer-status-service.js';
import pickChallengeService from '../domain/services/pick-challenge-service.js';
import { usecases } from '../domain/usecases/index.js';
import { scenarioSimulatorBatchSerializer } from '../infrastructure/serializers/scenario-simulator-batch-serializer.js';

async function simulateFlashAssessmentScenario(
  request,
  h,
  dependencies = {
    scenarioSimulatorBatchSerializer,
    random,
    pickAnswerStatusService,
    pickChallengeService,
  },
) {
  const {
    initialCapacity,
    numberOfIterations = 1,
    challengePickProbability,
    variationPercent,
    capacity,
    accessibilityAdjustmentNeeded,
    locale,
    complementaryCertificationKey,
    stopAtChallenge,
    versionId,
  } = request.payload;

  const pickAnswerStatus = dependencies.pickAnswerStatusService.pickAnswerStatusForCapacity(capacity);

  async function* generate() {
    const iterations = _.range(0, numberOfIterations);

    for (const index of iterations) {
      const pickChallenge = dependencies.pickChallengeService.getChallengePicker(challengePickProbability);

      const usecaseParams = _.omitBy(
        {
          pickAnswerStatus,
          pickChallenge,
          locale,
          initialCapacity,
          variationPercent,
          accessibilityAdjustmentNeeded,
          complementaryCertificationKey,
          stopAtChallenge,
          versionId,
        },
        _.isUndefined,
      );

      const simulationReport = await usecases.simulateFlashAssessmentScenario(usecaseParams);

      yield JSON.stringify({
        index,
        simulationReport: simulationReport.map((answer) => ({
          challengeId: answer.challenge.id,
          minimumCapability: answer.challenge.minimumCapability,
          difficulty: answer.challenge.difficulty,
          discriminant: answer.challenge.discriminant,
          reward: answer.reward,
          errorRate: answer.errorRate,
          answerStatus: answer.answerStatus,
          capacity: answer.capacity,
          numberOfAvailableChallenges: answer.numberOfAvailableChallenges,
        })),
      }) + '\n';
    }
  }

  const generatedResponse = Readable.from(generate(), { objectMode: false });
  return h.response(generatedResponse).type('text/event-stream; charset=utf-8');
}

export const scenarioSimulatorController = { simulateFlashAssessmentScenario };
