const usecases = require('../../domain/usecases');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils');
const scoringSimulationContextSerializer = require('../../infrastructure/serializers/json/scoring-simulator/scoring-simulation-context-serializer');
const scoringSimulationDatasetSerializer = require('../../infrastructure/serializers/json/scoring-simulator/scoring-simulation-dataset-serializer');

module.exports = {
  async calculateOldScores(request, h) {
    const dataset = scoringSimulationDatasetSerializer.deserialize(request);

    const results = await usecases.simulateOldScoring({ simulations: dataset.simulations });

    return h.response({
      datasetId: dataset.id,
      results,
      date: new Date().toISOString(),
    });
  },

  async calculateFlashScores(request, h) {
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
  },
};
