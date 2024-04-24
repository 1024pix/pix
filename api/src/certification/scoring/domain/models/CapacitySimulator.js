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
      (intervalMaxValue - intervalMinValue) * (score / SCORE_THRESHOLD - (intervalIndex + 1)) + intervalMaxValue;

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
  return competenceForScoring.findIndex(({ bounds }) => capacity < bounds.max && capacity >= bounds.min);
}
