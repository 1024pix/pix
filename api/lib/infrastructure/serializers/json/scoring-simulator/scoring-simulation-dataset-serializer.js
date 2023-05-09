import { ScoringSimulation } from '../../../../domain/models/ScoringSimulation.js';
import { ScoringSimulationDataset } from '../../../../domain/models/ScoringSimulationDataset.js';
import { Answer } from '../../../../domain/models/Answer.js';

const deserialize = function (request) {
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
};

export { deserialize };
