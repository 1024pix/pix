const ScoringSimulation = require('../../domain/models/ScoringSimulation');
const Answer = require('../../domain/models/Answer');
const usecases = require('../../domain/usecases');

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
    return h.response({}).code(200);
  },
};
