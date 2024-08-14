import { Readable } from 'node:stream';

import _ from 'lodash';

import { pickChallengeService } from '../../../evaluation/domain/services/pick-challenge-service.js';
import { random } from '../../../shared/infrastructure/utils/random.js';
import { extractLocaleFromRequest } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { pickAnswerStatusService } from '../../shared/domain/services/pick-answer-status-service.js';
import { FlashAssessmentSuccessRateHandler } from '../domain/models/FlashAssessmentSuccessRateHandler.js';
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
    extractLocaleFromRequest,
  },
) {
  const {
    stopAtChallenge,
    initialCapacity,
    numberOfIterations = 1,
    warmUpLength,
    forcedCompetences,
    useObsoleteChallenges,
    challengePickProbability,
    challengesBetweenSameCompetence,
    limitToOneQuestionPerTube,
    minimumEstimatedSuccessRateRanges: minimumEstimatedSuccessRateRangesDto,
    enablePassageByAllCompetences,
    doubleMeasuresUntil,
    variationPercent,
    variationPercentUntil,
  } = request.payload;

  const pickAnswerStatus = _getPickAnswerStatusMethod(dependencies.pickAnswerStatusService, request.payload);

  const locale = dependencies.extractLocaleFromRequest(request);

  const minimumEstimatedSuccessRateRanges = _minimumEstimatedSuccessRateRangesToDomain(
    minimumEstimatedSuccessRateRangesDto,
  );

  async function* generate() {
    const iterations = _.range(0, numberOfIterations);

    for (const index of iterations) {
      const pickChallenge = dependencies.pickChallengeService.chooseNextChallenge(challengePickProbability);

      const usecaseParams = _.omitBy(
        {
          pickAnswerStatus,
          pickChallenge,
          locale,
          stopAtChallenge,
          initialCapacity,
          warmUpLength,
          forcedCompetences,
          useObsoleteChallenges,
          challengesBetweenSameCompetence,
          limitToOneQuestionPerTube,
          minimumEstimatedSuccessRateRanges,
          enablePassageByAllCompetences,
          doubleMeasuresUntil,
          variationPercent,
          variationPercentUntil,
        },
        _.isUndefined,
      );

      const simulationReport = await usecases.simulateFlashDeterministicAssessmentScenario(usecaseParams);

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
        })),
      }) + '\n';
    }
  }

  const generatedResponse = Readable.from(generate(), { objectMode: false });
  return h.response(generatedResponse).type('text/event-stream; charset=utf-8');
}

function _getPickAnswerStatusMethod(pickAnswerStatusService, payload) {
  const { type, probabilities, length, capacity, answerStatusArray } = payload;

  switch (type) {
    case 'deterministic':
      return pickAnswerStatusService.pickAnswerStatusFromArray(answerStatusArray);
    case 'random': {
      const answer = _generateAnswerStatusArray(random, probabilities, length);
      return pickAnswerStatusService.pickAnswerStatusFromArray(answer);
    }
    case 'capacity':
      return pickAnswerStatusService.pickAnswerStatusForCapacity(capacity);
  }
}

function _generateAnswerStatusArray(random, probabilities, length) {
  return random.weightedRandoms(probabilities, length);
}

function _minimumEstimatedSuccessRateRangesToDomain(successRateRanges) {
  if (!successRateRanges) {
    return undefined;
  }

  return successRateRanges.map((successRateRange) => {
    return FlashAssessmentSuccessRateHandler.create(successRateRange);
  });
}

export const scenarioSimulatorController = { simulateFlashAssessmentScenario };
