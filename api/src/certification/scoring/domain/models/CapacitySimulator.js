import { Intervals } from './Intervals.js';
import { ScoringAndCapacitySimulatorReport } from './ScoringAndCapacitySimulatorReport.js';

export class CapacitySimulator {
  static compute({ certificationScoringIntervals, competencesForScoring, score }) {
    const scoringIntervals = new Intervals({ intervals: certificationScoringIntervals });
    const MAX_PIX_SCORE = 1024;
    const numberOfIntervals = scoringIntervals.length();
    const SCORE_THRESHOLD = MAX_PIX_SCORE / numberOfIntervals;

    const intervalIndex = Math.floor(score / SCORE_THRESHOLD);

    const intervalMaxValue = scoringIntervals.max(intervalIndex);
    const intervalMinValue = scoringIntervals.min(intervalIndex);

    const capacity =
      (intervalMaxValue - intervalMinValue) * ((score + 1) / SCORE_THRESHOLD - (intervalIndex + 1)) + intervalMaxValue;

    const competences = competencesForScoring.map(({ intervals, competenceCode }) => {
      const competenceIntervals = new Intervals({ intervals });
      return {
        competenceCode,
        level: intervals[competenceIntervals.findIntervalIndex(capacity)].competenceLevel,
      };
    });

    return new ScoringAndCapacitySimulatorReport({
      score,
      capacity,
      competences,
    });
  }
}
