import { usecases } from '../../domain/usecases/index.js';
import { extractLocaleFromRequest } from '../../infrastructure/utils/request-response-utils.js';
import { random } from '../../infrastructure/utils/random.js';
import { scenarioSimulatorBatchSerializer } from '../../infrastructure/serializers/jsonapi/scenario-simulator-batch-serializer.js';
import { parseCsv } from '../../../scripts/helpers/csvHelpers.js';
import { pickAnswerStatusService } from '../../domain/services/pick-answer-status-service.js';
import { HttpErrors } from '../http-errors.js';
import _ from 'lodash';
import { pickChallengeService } from '../../domain/services/pick-challenge-service.js';

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
    assessmentId,
    stopAtChallenge,
    initialCapacity,
    numberOfIterations = 1,
    warmUpLength,
    forcedCompetences,
    useObsoleteChallenges,
    challengePickProbability,
  } = request.payload;

  const pickAnswerStatus = _getPickAnswerStatusMethod(dependencies.pickAnswerStatusService, request.payload);

  const locale = dependencies.extractLocaleFromRequest(request);

  const result = await Promise.all(
    _.range(0, numberOfIterations).map(async (index) => {
      const pickChallenge = dependencies.pickChallengeService.chooseNextChallenge(
        `${assessmentId}-${index}`,
        challengePickProbability
      );

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
        },
        _.isUndefined,
      );
      return {
        index,
        simulationReport: await usecases.simulateFlashDeterministicAssessmentScenario(usecaseParams),
      };
    }),
  );

  return dependencies.scenarioSimulatorBatchSerializer.serialize(result);
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

export const scenarioSimulatorController = { simulateFlashAssessmentScenario, importScenarios };
