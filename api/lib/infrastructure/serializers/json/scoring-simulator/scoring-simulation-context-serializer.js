const ScoringSimulationContext = require('../../../../domain/models/ScoringSimulationContext.js');

module.exports = {
  deserialize(request) {
    return new ScoringSimulationContext(request.payload.context);
  },
};
