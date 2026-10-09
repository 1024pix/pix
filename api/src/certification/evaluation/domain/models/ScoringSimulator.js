import { CORE_MESH_CONFIGURATION } from '../../../shared/domain/constants/mesh-configuration.js';
import { Intervals } from './Intervals.js';
import { ScoringAndCapacitySimulatorReport } from './ScoringAndCapacitySimulatorReport.js';

export class ScoringSimulator {
  static compute({ capacity, certificationScoringIntervals, competencesForScoring, maxReachablePixScore }) {
    const scoringIntervals = new Intervals({ intervals: certificationScoringIntervals });

    const intervalIndex = scoringIntervals.findIntervalIndexFromCapacity(capacity);

    const score = _calculateScore({
      certificationScoringIntervals: scoringIntervals,
      capacity,
      intervalIndex,
      maxReachablePixScore,
    });

    const competences = _computeCompetences({ competencesForScoring, capacity });

    return new ScoringAndCapacitySimulatorReport({
      capacity,
      score: Math.round(score),
      competences,
    });
  }
}

function _calculateScore({ certificationScoringIntervals, capacity, intervalIndex, maxReachablePixScore }) {
  const MIN_PIX_SCORE = 0;

  if (certificationScoringIntervals.isCapacityAboveMaximum(capacity)) {
    return maxReachablePixScore;
  }

  if (intervalIndex === null) {
    return MIN_PIX_SCORE;
  }

  const intervalMaximum = certificationScoringIntervals.max(intervalIndex);
  const intervalMinimum = certificationScoringIntervals.min(intervalIndex);
  const meshes = Array.from(CORE_MESH_CONFIGURATION.values());
  const intervalWeight = meshes[intervalIndex].weight;
  const intervalCoefficient = meshes[intervalIndex].coefficient;
  const progressionPercentage = 1 - (intervalMaximum - capacity) / (intervalMaximum - intervalMinimum);
  const score = Math.floor(intervalWeight * (intervalCoefficient + progressionPercentage));

  return Math.min(maxReachablePixScore, score);
}

function _computeCompetences({ competencesForScoring, capacity }) {
  return competencesForScoring.map(({ intervals, competenceCode }) => {
    const competenceIntervals = new Intervals({ intervals });
    const intervalForCompetence = competenceIntervals.findIntervalIndexFromCapacity(capacity);
    return {
      competenceCode,
      level: intervalForCompetence ? intervals[intervalForCompetence].competenceLevel : 0,
    };
  });
}
