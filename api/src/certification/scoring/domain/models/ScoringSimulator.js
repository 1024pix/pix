import { COMPETENCES_COUNT, PIX_COUNT_BY_LEVEL } from '../../../../../lib/domain/constants.js';
import { config } from '../../../../shared/config.js';
import { CertificationAssessmentScoreV3 } from './CertificationAssessmentScoreV3.js';
import { Intervals } from './Intervals.js';
import { ScoringAndCapacitySimulatorReport } from './ScoringAndCapacitySimulatorReport.js';

export class ScoringSimulator {
  static compute({ capacity, certificationScoringIntervals, competencesForScoring }) {
    const scoringIntervals = new Intervals({ intervals: certificationScoringIntervals });

    const intervalIndex = scoringIntervals.findIntervalIndexFromCapacity(capacity);

    const score = _calculateScore({
      certificationScoringIntervals: scoringIntervals,
      capacity,
      intervalIndex,
    });

    const competences = _computeCompetences({ competencesForScoring, capacity });

    return new ScoringAndCapacitySimulatorReport({
      capacity,
      score: Math.round(score),
      competences,
    });
  }
}

function _calculateScore({ certificationScoringIntervals, capacity, intervalIndex }) {
  const MAX_REACHABLE_LEVEL = config.v3Certification.maxReachableLevel;
  const MIN_PIX_SCORE = 0;
  const maximumReachableScore = MAX_REACHABLE_LEVEL * COMPETENCES_COUNT * PIX_COUNT_BY_LEVEL - 1;

  if (certificationScoringIntervals.isCapacityBelowMinimum(capacity)) {
    return MIN_PIX_SCORE;
  }

  if (certificationScoringIntervals.isCapacityAboveMaximum(capacity)) {
    return maximumReachableScore;
  }

  const intervalMaximum = certificationScoringIntervals.max(intervalIndex);
  const intervalMinimum = certificationScoringIntervals.min(intervalIndex);
  const intervalWeight = CertificationAssessmentScoreV3.weightsAndCoefficients[intervalIndex].weight;
  const intervalCoefficient = CertificationAssessmentScoreV3.weightsAndCoefficients[intervalIndex].coefficient;
  const progressionPercentage = 1 - (intervalMaximum - capacity) / (intervalMaximum - intervalMinimum);
  const score = Math.floor(intervalWeight * (intervalCoefficient + progressionPercentage));

  return Math.min(maximumReachableScore, score);
}

function _computeCompetences({ competencesForScoring, capacity }) {
  return competencesForScoring.map(({ intervals, competenceCode }) => {
    const competenceIntervals = new Intervals({ intervals });
    return {
      competenceCode,
      level: intervals[competenceIntervals.findIntervalIndexFromCapacity(capacity)].competenceLevel,
    };
  });
}
