import { COMPETENCES_COUNT, PIX_COUNT_BY_LEVEL } from '../../../../../lib/domain/constants.js';
import { Intervals } from './Intervals.js';
import { ScoringAndCapacitySimulatorReport } from './ScoringAndCapacitySimulatorReport.js';

export class ScoringSimulator {
  static compute({ capacity, certificationScoringIntervals, competencesForScoring }) {
    const scoringIntervals = new Intervals({ intervals: certificationScoringIntervals });

    const intervalIndex = scoringIntervals.findIntervalIndex(capacity);
    const intervalWidth = scoringIntervals.intervalWidth(intervalIndex);
    const valueToIntervalMax = scoringIntervals.toIntervalMax(intervalIndex, capacity);

    const score = _calculateScore({
      certificationScoringIntervals: scoringIntervals,
      capacity,
      intervalIndex,
      valueToIntervalMax,
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

function _calculateScore({
  certificationScoringIntervals,
  capacity,
  intervalIndex,
  valueToIntervalMax,
  intervalWidth,
}) {
  const MAX_PIX_SCORE = 1024;
  const numberOfIntervals = certificationScoringIntervals.length();
  const SCORE_THRESHOLD = MAX_PIX_SCORE / numberOfIntervals;
  const MAX_REACHABLE_LEVEL = 7;
  const MIN_PIX_SCORE = 0;
  const maximumReachableScore = MAX_REACHABLE_LEVEL * COMPETENCES_COUNT * PIX_COUNT_BY_LEVEL - 1;

  if (certificationScoringIntervals.isCapacityBelowMinimum(capacity)) {
    return MIN_PIX_SCORE;
  }

  if (certificationScoringIntervals.isCapacityAboveMaximum(capacity)) {
    return maximumReachableScore;
  }

  const score = Math.ceil(SCORE_THRESHOLD * (intervalIndex + 1 + valueToIntervalMax / intervalWidth)) - 1;

  return Math.min(maximumReachableScore, score);
}

function _computeCompetences({ competencesForScoring, capacity }) {
  return competencesForScoring.map(({ intervals, competenceCode }) => {
    const competenceIntervals = new Intervals({ intervals });
    return {
      competenceCode,
      level: intervals[competenceIntervals.findIntervalIndex(capacity)].competenceLevel,
    };
  });
}
