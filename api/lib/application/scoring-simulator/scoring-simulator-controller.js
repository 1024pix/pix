const ScoringSimulation = require('../../domain/models/ScoringSimulation');
const Answer = require('../../domain/models/Answer');
const usecases = require('../../domain/usecases');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils');

module.exports = {
  async calculateOldScores(request, h) {
    const simulations = request.payload.simulations.map(
      (simulation) =>
        new ScoringSimulation({
          id: simulation.id,
          answers: simulation.answers.map((answer) => new Answer(answer)),
        })
    );

    const results = await usecases.simulateOldScoring({ simulations });

    return h.response({ results });
  },

  async calculateFlashScores(request, h) {
    const simulations = request.payload.simulations.map(
      (simulation) =>
        new ScoringSimulation({
          id: simulation.id,
          estimatedLevel: simulation.estimatedLevel,
          answers: simulation.answers?.map((answer) => new Answer(answer)),
        })
    );

    const locale = extractLocaleFromRequest(request);

    const results = await usecases.simulateFlashScoring({
      successProbabilityThreshold: request.payload.successProbabilityThreshold,
      calculateEstimatedLevel: request.payload.calculateEstimatedLevel,
      simulations,
      locale,
    });

    return h.response({ results });
  },
};
