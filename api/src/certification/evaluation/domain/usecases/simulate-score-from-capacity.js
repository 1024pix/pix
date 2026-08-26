import { NotFoundError } from '../../../../shared/domain/errors.js';
import { ScoringSimulator } from '../models/ScoringSimulator.js';

/**
 * @throws {NotFoundError}
 */
export async function simulateScoreFromCapacity({ capacity, date, scoringConfigurationRepository }) {
  const v3CertificationScoring = await scoringConfigurationRepository.getLatestByDateAndLocale({
    locale: 'fr-fr',
    date,
  });

  if (!v3CertificationScoring) {
    throw new NotFoundError(`No certification scoring configuration found for date ${date.toISOString()}`);
  }

  const certificationScoringIntervals = v3CertificationScoring.intervals;
  const maxReachableLevel = v3CertificationScoring.maxReachableLevel;

  return ScoringSimulator.compute({
    capacity,
    certificationScoringIntervals,
    competencesForScoring: v3CertificationScoring.competencesForScoring,
    maxReachableLevel,
  });
}
