import { Readable } from 'node:stream';

import _ from 'lodash';

import { HttpErrors } from '../../../../lib/application/http-errors.js';
import { pickAnswerStatusService } from '../../../../lib/domain/services/pick-answer-status-service.js';
import { scenarioSimulatorBatchSerializer } from '../../../../lib/infrastructure/serializers/jsonapi/scenario-simulator-batch-serializer.js';
import { random } from '../../../../lib/infrastructure/utils/random.js';
import { parseCsv } from '../../../../scripts/helpers/csvHelpers.js';
import { pickChallengeService } from '../../../evaluation/domain/services/pick-challenge-service.js';
import { extractLocaleFromRequest } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { scoringDegradationService } from '../../scoring/domain/services/scoring-degradation-service.js';
import { FlashAssessmentSuccessRateHandler } from '../domain/models/FlashAssessmentSuccessRateHandler.js';
import { usecases } from '../domain/usecases/index.js';

async function simulateFlashAssessmentScenario(
  request,
  h,
  dependencies = {
    scenarioSimulatorBatchSerializer,
    random,
    pickAnswerStatusService,
    pickChallengeService,
    scoringDegradationService,
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
    startCapacityDegradationAt,
  } = request.payload;

  const pickAnswerStatus = _getPickAnswerStatusMethod(dependencies.pickAnswerStatusService, request.payload);

  const locale = dependencies.extractLocaleFromRequest(request);

  const minimumEstimatedSuccessRateRanges = _minimumEstimatedSuccessRateRangesToDomain(
    minimumEstimatedSuccessRateRangesDto,
  );

  async function* generate() {
    const iterations = _.range(0, numberOfIterations);

    for (const index of iterations) {
      const usecaseParams = _.omitBy(
        {
          pickAnswerStatus,
          pickChallenge: dependencies.pickChallengeService,
          challengePickProbability,
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
          startCapacityDegradationAt,
          scoringDegradationService,
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

async function importScenarios(
  request,
  h,
  dependencies = { parseCsv, pickChallengeService, scenarioSimulatorBatchSerializer, extractLocaleFromRequest },
) {
  const parsedCsvData = await dependencies.parseCsv(request.payload.path);

  if (!_isValidAnswerStatusArray(parsedCsvData)) {
    return new HttpErrors.BadRequestError("Each CSV cell must be one of 'ok', 'ko' or 'aband'");
  }

  const locale = dependencies.extractLocaleFromRequest(request);

  const results = (
    await Promise.all(
      parsedCsvData.map(async (answerStatusArray, index) => {
        const pickAnswerStatus = pickAnswerStatusService.pickAnswerStatusFromArray(answerStatusArray);
        const pickChallenge = dependencies.pickChallengeService.chooseNextChallenge(index);

        return usecases.simulateFlashDeterministicAssessmentScenario({
          pickAnswerStatus,
          pickChallenge,
          locale,
        });
      }),
    )
  ).map((simulationReport, index) => ({
    index,
    simulationReport,
  }));

  return dependencies.scenarioSimulatorBatchSerializer.serialize(results);
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

function _isValidAnswerStatusArray(answerStatusArray) {
  return answerStatusArray.every((row) => row.every((cell) => ['ok', 'ko', 'aband'].includes(cell)));
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

export const scenarioSimulatorController = { simulateFlashAssessmentScenario, importScenarios };
