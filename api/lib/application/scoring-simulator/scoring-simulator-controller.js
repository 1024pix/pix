const OldScoringSimulation = require('../../domain/models/OldScoringSimulation');
const Answer = require('../../domain/models/Answer');
const usecases = require('../../domain/usecases');

module.exports = {
  async calculateOldScores(request, h) {
    const simulations = request.payload.simulations.map(
      (simulation) =>
        new OldScoringSimulation({
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
