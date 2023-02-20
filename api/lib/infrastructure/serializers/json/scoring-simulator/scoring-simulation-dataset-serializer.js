import ScoringSimulation from '../../../../domain/models/ScoringSimulation';
import ScoringSimulationDataset from '../../../../domain/models/ScoringSimulationDataset';
import Answer from '../../../../domain/models/Answer';

export default {
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
