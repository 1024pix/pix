import { Answer } from '../../../../../src/evaluation/domain/models/Answer.js';
import { ScoringSimulation } from '../../../../../src/shared/domain/models/ScoringSimulation.js';
import { ScoringSimulationDataset } from '../../../../../src/shared/domain/models/ScoringSimulationDataset.js';

const deserialize = function (request) {
  const simulations = request.payload.dataset.simulations.map(
    (simulation) =>
      new ScoringSimulation({
        ...simulation,
        answers: simulation.answers?.map((answer) => new Answer(answer)),
      }),
  );

  return new ScoringSimulationDataset({
    ...request.payload.dataset,
    simulations,
  });
};

export { deserialize };
