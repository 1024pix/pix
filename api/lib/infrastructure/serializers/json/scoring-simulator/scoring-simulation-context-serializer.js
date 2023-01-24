const ScoringSimulationContext = require('../../../../domain/models/ScoringSimulationContext');

module.exports = {
  deserialize(request) {
    return new ScoringSimulationContext(request.payload.context);
  },
};
