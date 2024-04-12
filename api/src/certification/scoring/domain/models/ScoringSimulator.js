import { ScoringAndCapacitySimulatorReport } from './ScoringAndCapacitySimulatorReport.js';

export class ScoringSimulator {
  static compute({ capacity, certificationScoringIntervals, competencesForScoring }) {
    const MAX_REACHABLE_LEVEL = 7;
    const MAX_PIX_SCORE = 1024;
    const NUMBER_OF_COMPETENCES = 16;
    const PIX_PER_LEVEL = 8;

    const numberOfIntervals = certificationScoringIntervals.length;
    const intervalHeight = MAX_PIX_SCORE / numberOfIntervals;

    let normalizedCapacity = capacity;
    const minimumCapacity = certificationScoringIntervals[0].bounds.min;
    const maximumCapacity = certificationScoringIntervals.at(-1).bounds.max;

    if (normalizedCapacity < minimumCapacity) {
      normalizedCapacity = minimumCapacity;
    }
    if (normalizedCapacity > maximumCapacity) {
      normalizedCapacity = maximumCapacity;
    }

    const intervalIndex = _findIntervalIndex(normalizedCapacity, certificationScoringIntervals);

    const intervalMaxValue = certificationScoringIntervals[intervalIndex].bounds.max;
    const intervalWidth =
      certificationScoringIntervals[intervalIndex].bounds.max - certificationScoringIntervals[intervalIndex].bounds.min;

    const score = intervalHeight * (intervalIndex + 1 + (normalizedCapacity - intervalMaxValue) / intervalWidth);

    const maximumReachableScore = MAX_REACHABLE_LEVEL * NUMBER_OF_COMPETENCES * PIX_PER_LEVEL;

    const limitedScore = Math.min(maximumReachableScore, score);

    const competences = competencesForScoring.map(({ intervals, competenceCode }) => {
      return {
        competenceCode,
        level: intervals[_findIntervalIndex(normalizedCapacity, intervals)].competenceLevel,
      };
    });

    return new ScoringAndCapacitySimulatorReport({
      score: Math.round(limitedScore),
      competences,
    });
  }
}

function _findIntervalIndex(capacity, certificationScoringIntervals) {
  return certificationScoringIntervals.findIndex(({ bounds }) => capacity < bounds.max && capacity >= bounds.min);
}
