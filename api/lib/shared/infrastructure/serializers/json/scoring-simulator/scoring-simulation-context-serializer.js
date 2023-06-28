import { ScoringSimulationContext } from '../../../../domain/models/ScoringSimulationContext.js';

const deserialize = function (request) {
  return new ScoringSimulationContext(request.payload.context);
};

export { deserialize };
