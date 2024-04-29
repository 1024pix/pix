import { ScoringAndCapacitySimulatorReport } from './ScoringAndCapacitySimulatorReport.js';

export class ScoringSimulator {
  static compute({ capacity, certificationScoringIntervals, competencesForScoring }) {
    const intervalIndex = _findIntervalIndex(capacity, certificationScoringIntervals);

    const intervalWidth =
      certificationScoringIntervals[intervalIndex].bounds.max - certificationScoringIntervals[intervalIndex].bounds.min;

    const differenceBetweenCapacityAndMaximumIntervalCapacity =
      capacity - certificationScoringIntervals[intervalIndex].bounds.max;

    const score = _calculateScore({
      certificationScoringIntervals,
      capacity,
      intervalIndex,
      differenceBetweenCapacityAndMaximumIntervalCapacity,
      intervalWidth,
    });
    const competences = _computeCompetences({ competencesForScoring, capacity });

    return new ScoringAndCapacitySimulatorReport({
      capacity,
      score: Math.round(score),
      competences,
    });
  }
}

function _findIntervalIndex(capacity, certificationScoringIntervals) {
  if (capacity < certificationScoringIntervals[0].bounds.min) {
    return 0;
  }

  for (const [index, { bounds }] of certificationScoringIntervals.entries()) {
    if (bounds.max >= capacity) {
      return index;
    }
  }

  return certificationScoringIntervals.length - 1;
}

function _calculateScore({
  certificationScoringIntervals,
  capacity,
  intervalIndex,
  differenceBetweenCapacityAndMaximumIntervalCapacity,
  intervalWidth,
}) {
  const MAX_PIX_SCORE = 1024;
  const numberOfIntervals = certificationScoringIntervals.length;
  const SCORE_THRESHOLD = MAX_PIX_SCORE / numberOfIntervals;
  const MAX_REACHABLE_LEVEL = 7;
  const NUMBER_OF_COMPETENCES = 16;
  const MIN_PIX_SCORE = 0;
  const PIX_PER_LEVEL = 8;
  const maximumReachableScore = MAX_REACHABLE_LEVEL * NUMBER_OF_COMPETENCES * PIX_PER_LEVEL - 1;

  if (_isCapacityBelowMinimum(capacity, certificationScoringIntervals)) {
    return MIN_PIX_SCORE;
  }

  if (_isCapacityAboveMaximum(capacity, certificationScoringIntervals)) {
    return maximumReachableScore;
  }

  const score =
    Math.ceil(
      SCORE_THRESHOLD * (intervalIndex + 1 + differenceBetweenCapacityAndMaximumIntervalCapacity / intervalWidth),
    ) - 1;

  return Math.min(maximumReachableScore, score);
}

function _isCapacityBelowMinimum(capacity, certificationScoringIntervals) {
  return capacity <= certificationScoringIntervals[0].bounds.min;
}

function _isCapacityAboveMaximum(capacity, certificationScoringIntervals) {
  return capacity >= certificationScoringIntervals.at(-1).bounds.max;
}

function _computeCompetences({ competencesForScoring, capacity }) {
  return competencesForScoring.map(({ intervals, competenceCode }) => {
    return {
      competenceCode,
      level: intervals[_findIntervalIndex(capacity, intervals)].competenceLevel,
    };
  });
}
