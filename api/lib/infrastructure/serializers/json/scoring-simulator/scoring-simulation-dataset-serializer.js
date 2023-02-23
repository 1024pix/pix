const ScoringSimulation = require('../../../../domain/models/ScoringSimulation.js');
const ScoringSimulationDataset = require('../../../../domain/models/ScoringSimulationDataset.js');
const Answer = require('../../../../domain/models/Answer.js');

module.exports = {
  deserialize(request) {
    const simulations = request.payload.dataset.simulations.map(
      (simulation) =>
        new ScoringSimulation({
          ...simulation,
          answers: simulation.answers?.map((answer) => new Answer(answer)),
        })
    );

    return new ScoringSimulationDataset({
      ...request.payload.dataset,
      simulations,
    });
  },
};
