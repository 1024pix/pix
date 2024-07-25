import { ScoringSimulationContext } from '../../../../../src/shared/domain/models/ScoringSimulationContext.js';

const deserialize = function (request) {
  return new ScoringSimulationContext(request.payload.context);
};

export { deserialize };
