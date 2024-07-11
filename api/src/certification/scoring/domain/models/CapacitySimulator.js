import { CertificationAssessmentScoreV3 } from './CertificationAssessmentScoreV3.js';
import { Intervals } from './Intervals.js';
import { ScoringAndCapacitySimulatorReport } from './ScoringAndCapacitySimulatorReport.js';

export class CapacitySimulator {
  static compute({ certificationScoringIntervals, competencesForScoring, score }) {
    const scoringIntervals = new Intervals({ intervals: certificationScoringIntervals });

    const { weightsAndCoefficients } = CertificationAssessmentScoreV3;
    const weights = weightsAndCoefficients.map(({ weight }) => weight);

    const intervalIndex = findIntervalIndexFromScore({
      score,
      weights,
      scoringIntervalsLength: scoringIntervals.length(),
    });

    const intervalMaxValue = scoringIntervals.max(intervalIndex);
    const intervalMinValue = scoringIntervals.min(intervalIndex);

    const intervalWeight = weightsAndCoefficients[intervalIndex].weight;
    const intervalCoefficient = weightsAndCoefficients[intervalIndex].coefficient;

    const capacity =
      (score / intervalWeight - intervalCoefficient) * (intervalMaxValue - intervalMinValue) + intervalMinValue;

    const competences = competencesForScoring.map(({ intervals, competenceCode }) => {
      const competenceIntervals = new Intervals({ intervals });
      return {
        competenceCode,
        level: intervals[competenceIntervals.findIntervalIndexFromCapacity(capacity)].competenceLevel,
      };
    });

    return new ScoringAndCapacitySimulatorReport({
      score,
      capacity,
      competences,
    });
  }
}

export function findIntervalIndexFromScore({ score, scoringIntervalsLength, weights }) {
  let cumulativeSumOfWeights = weights[0];
  let currentScoringInterval = 0;

  while (
    _isPixScoreOfAnHigherInterval(score, cumulativeSumOfWeights) &&
    _hasANextInterval(currentScoringInterval, scoringIntervalsLength)
  ) {
    currentScoringInterval++;
    cumulativeSumOfWeights += weights[currentScoringInterval];
  }

  return currentScoringInterval;
}

function _isPixScoreOfAnHigherInterval(score, nextIntervalMinimumScore) {
  return score >= nextIntervalMinimumScore;
}

function _hasANextInterval(currentInterval, scoringIntervalsLength) {
  return currentInterval < scoringIntervalsLength - 1;
}
