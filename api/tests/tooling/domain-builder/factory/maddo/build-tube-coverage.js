import { TubeCoverage } from '../../../../../src/maddo/domain/models/TubeCoverage.js';

export function buildTubeCoverage({
  id,
  competenceId,
  competenceName,
  competenceIndex,
  areaName,
  maxLevel,
  reachedLevel,
  practicalDescription,
  practicalTitle,
} = {}) {
  return new TubeCoverage({
    id,
    competenceId,
    competenceName,
    competenceIndex,
    areaName,
    maxLevel,
    reachedLevel,
    practicalDescription,
    practicalTitle,
  });
}
