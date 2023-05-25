import { usecases } from '../../domain/usecases/index.js';
import { extractLocaleFromRequest } from '../../infrastructure/utils/request-response-utils.js';
import { scenarioSimulatorSerializer } from '../../infrastructure/serializers/jsonapi/scenario-simulator-serializer.js';
import { random } from '../../infrastructure/utils/random.js';
import { scenarioSimulatorBatchSerializer } from '../../infrastructure/serializers/jsonapi/scenario-simulator-batch-serializer.js';
import { parseCsv } from '../../../scripts/helpers/csvHelpers.js';

async function simulateFlashAssessmentScenario(request, h, dependencies = { scenarioSimulatorSerializer, random }) {
  const { assessmentId, type, probabilities, length } = request.payload;
  const simulationAnswers =
    type === 'deterministic'
      ? request.payload.simulationAnswers
      : _generateSimulationAnswers(random, probabilities, length);

  const locale = extractLocaleFromRequest(request);

  const result = await usecases.simulateFlashDeterministicAssessmentScenario({
    simulationAnswers,
    assessmentId,
    locale,
  });

  return dependencies.scenarioSimulatorSerializer.serialize(result);
}

async function importScenarios(request, h, dependencies = { parseCsv, scenarioSimulatorBatchSerializer }) {
  const parsedCsvData = await dependencies.parseCsv(request.payload.path);

  if (!_isValidSimulationAnswers(parsedCsvData)) {
    return h.response("Each CSV cell must be one of 'ok', 'ko' or 'aband'").code(400);
  }

  const locale = extractLocaleFromRequest(request);

  const results = (
    await Promise.all(
      parsedCsvData.map(async (simulationAnswers, index) => {
        return usecases.simulateFlashDeterministicAssessmentScenario({
          simulationAnswers,
          assessmentId: index,
          locale,
        });
      })
    )
  ).map((simulationReport, index) => ({
    index,
    simulationReport,
  }));

  return dependencies.scenarioSimulatorBatchSerializer.serialize(results);
}

function _isValidSimulationAnswers(simulationAnswers) {
  return simulationAnswers.every((row) => row.every((cell) => ['ok', 'ko', 'aband'].includes(cell)));
}

function _generateSimulationAnswers(random, probabilities, length) {
  return random.randomsInEnum(probabilities, length);
}

export const scenarioSimulatorController = { simulateFlashAssessmentScenario, importScenarios };
