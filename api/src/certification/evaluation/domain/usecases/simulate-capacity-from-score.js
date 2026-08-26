import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CapacitySimulator } from '../models/CapacitySimulator.js';

/**
 * @throws {NotFoundError}
 */
export async function simulateCapacityFromScore({ score, date, scoringConfigurationRepository }) {
  const v3CertificationScoring = await scoringConfigurationRepository.getLatestByDateAndLocale({
    locale: 'fr-fr',
    date,
  });

  if (!v3CertificationScoring) {
    throw new NotFoundError(`No certification scoring configuration found for date ${date.toISOString()}`);
  }

  const certificationScoringIntervals = v3CertificationScoring.intervals;
  const maxReachableLevel = v3CertificationScoring.maxReachableLevel;

  return CapacitySimulator.compute({
    score,
    certificationScoringIntervals,
    competencesForScoring: v3CertificationScoring.competencesForScoring,
    maxReachableLevel,
  });
}
