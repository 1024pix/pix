import { TubeCoverage } from '../../../../../src/maddo/domain/models/TubeCoverage.js';

export function buildTubeCoverage({
  id,
  competenceId,
  areaName,
  maxLevel,
  reachedLevel,
  practicalDescription,
  practicalTitle,
} = {}) {
  return new TubeCoverage({
    id,
    competenceId,
    areaName,
    maxLevel,
    reachedLevel,
    practicalDescription,
    practicalTitle,
  });
}
