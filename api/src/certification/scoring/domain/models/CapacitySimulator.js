import { ScoringAndCapacitySimulatorReport } from './ScoringAndCapacitySimulatorReport.js';

export class CapacitySimulator {
  static compute({ certificationScoringIntervals, competencesForScoring, score }) {
    const MAX_PIX_SCORE = 1024;
    const numberOfIntervals = certificationScoringIntervals.length;
    const SCORE_THRESHOLD = MAX_PIX_SCORE / numberOfIntervals;

    const intervalIndex = Math.floor(score / SCORE_THRESHOLD);

    const intervalMaxValue = certificationScoringIntervals[intervalIndex].bounds.max;
    const intervalMinValue = certificationScoringIntervals[intervalIndex].bounds.min;

    const capacity =
      (intervalMaxValue - intervalMinValue) * ((score + 1) / SCORE_THRESHOLD - (intervalIndex + 1)) + intervalMaxValue;

    const competences = competencesForScoring.map(({ intervals, competenceCode }) => {
      return {
        competenceCode,
        level: intervals[_findIntervalIndex(capacity, intervals)].competenceLevel,
      };
    });

    return new ScoringAndCapacitySimulatorReport({
      score,
      capacity,
      competences,
    });
  }
}

function _findIntervalIndex(capacity, competenceForScoring) {
  if (capacity < competenceForScoring[0].bounds.min) {
    return 0;
  }

  for (const [index, { bounds }] of competenceForScoring.entries()) {
    if (bounds.max >= capacity) {
      return index;
    }
  }

  return competenceForScoring.length - 1;
}
