import { ScoringAndCapacitySimulatorReport } from '../../../../src/certification/scoring/domain/models/ScoringAndCapacitySimulatorReport.js';

function buildScoringAndCapacitySimulatorReport({
  capacity,
  score,
  competences = [
    { competenceCode: '1.1', level: 1 },
    { competenceCode: '1.2', level: 2 },
  ],
} = {}) {
  return new ScoringAndCapacitySimulatorReport({
    capacity,
    score,
    competences,
  });
}

export { buildScoringAndCapacitySimulatorReport };
