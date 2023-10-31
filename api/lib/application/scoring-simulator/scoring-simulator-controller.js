import { usecases } from '../../domain/usecases/index.js';
import { extractLocaleFromRequest } from '../../infrastructure/utils/request-response-utils.js';
import * as scoringSimulationContextSerializer from '../../infrastructure/serializers/json/scoring-simulator/scoring-simulation-context-serializer.js';
import * as scoringSimulationDatasetSerializer from '../../infrastructure/serializers/json/scoring-simulator/scoring-simulation-dataset-serializer.js';

const calculateOldScores = async function (request, h) {
  const dataset = scoringSimulationDatasetSerializer.deserialize(request);
  const locale = extractLocaleFromRequest(request);

  const results = await usecases.simulateOldScoring({ simulations: dataset.simulations, locale });

  return h.response({
    datasetId: dataset.id,
    results,
    date: new Date().toISOString(),
  });
};

const calculateFlashScores = async function (request, h) {
  const context = scoringSimulationContextSerializer.deserialize(request);
  const dataset = scoringSimulationDatasetSerializer.deserialize(request);
  const locale = extractLocaleFromRequest(request);

  const results = await usecases.simulateFlashScoring({
    context,
    simulations: dataset.simulations,
    locale,
  });

  return h.response({
    contextId: context.id,
    datasetId: dataset.id,
    results,
    date: new Date().toISOString(),
  });
};

const scoringSimulatorController = { calculateOldScores, calculateFlashScores };

export { scoringSimulatorController };
