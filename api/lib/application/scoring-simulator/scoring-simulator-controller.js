const ScoringSimulation = require('../../domain/models/ScoringSimulation');
const ScoringSimulationContext = require('../../domain/models/ScoringSimulationContext');
const ScoringSimulationDataset = require('../../domain/models/ScoringSimulationDataset');
const Answer = require('../../domain/models/Answer');
const usecases = require('../../domain/usecases');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils');

module.exports = {
  async calculateOldScores(request, h) {
    const dataset = deserializeScoringSimulationDataset(request);

    const results = await usecases.simulateOldScoring({ simulations: dataset.simulations });

    return h.response({
      datasetId: dataset.id,
      results,
    });
  },

  async calculateFlashScores(request, h) {
    const context = deserializeScoringSimulationContext(request);
    const dataset = deserializeScoringSimulationDataset(request);
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
    });
  },
};

function deserializeScoringSimulationDataset(request) {
  const simulations = request.payload.dataset.simulations.map(
    (simulation) =>
      new ScoringSimulation({
        ...simulation,
        answers: simulation.answers?.map((answer) => new Answer(answer)),
      })
  );

  return new ScoringSimulationDataset({
    id: request.payload.dataset.id,
    simulations,
  });
}

function deserializeScoringSimulationContext(request) {
  return new ScoringSimulationContext(request.payload.context);
}
