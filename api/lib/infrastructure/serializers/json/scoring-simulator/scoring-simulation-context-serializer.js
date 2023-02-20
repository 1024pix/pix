import ScoringSimulationContext from '../../../../domain/models/ScoringSimulationContext';

export default {
  deserialize(request) {
    return new ScoringSimulationContext(request.payload.context);
  },
};
