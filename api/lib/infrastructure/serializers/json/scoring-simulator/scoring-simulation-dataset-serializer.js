const ScoringSimulation = require('../../../../domain/models/ScoringSimulation');
const ScoringSimulationDataset = require('../../../../domain/models/ScoringSimulationDataset');
const Answer = require('../../../../domain/models/Answer');

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
