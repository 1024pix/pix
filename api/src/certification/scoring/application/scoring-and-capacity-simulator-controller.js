import { usecases } from '../domain/usecases/index.js';
import * as serializer from '../infrastructure/serializers/jsonapi/scoring-and-capacity-simulator-report-serializer.js';

const simulateScoringOrCapacity = async (req, h) => {
  const { capacity, score } = req.payload.data;

  let scoringAndCapacitySimulatorReport;
  if (score) {
    scoringAndCapacitySimulatorReport = await usecases.simulateCapacityFromScore({
      score,
      date: new Date(),
    });
  }

  if (capacity) {
    scoringAndCapacitySimulatorReport = await usecases.simulateScoreFromCapacity({
      capacity,
      date: new Date(),
    });
  }

  return h.response(serializer.serialize(scoringAndCapacitySimulatorReport)).code(200);
};

const scoringAndCapacitySimulatorController = {
  simulateScoringOrCapacity,
};

export { scoringAndCapacitySimulatorController };
