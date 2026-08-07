import { usecases } from '../domain/usecases/index.js';
import * as serializer from '../infrastructure/serializers/scoring-and-capacity-simulator-report-serializer.js';

async function simulateScoringOrCapacity(req, h) {
  const { capacity, score, date } = req.payload.data;

  let scoringAndCapacitySimulatorReport;
  if (score) {
    scoringAndCapacitySimulatorReport = await usecases.simulateCapacityFromScore({
      score,
      date,
    });
  }

  if (capacity) {
    scoringAndCapacitySimulatorReport = await usecases.simulateScoreFromCapacity({
      capacity,
      date,
    });
  }

  return h.response(serializer.serialize(scoringAndCapacitySimulatorReport)).code(200);
}

export const scoringAndCapacitySimulatorController = {
  simulateScoringOrCapacity,
};
