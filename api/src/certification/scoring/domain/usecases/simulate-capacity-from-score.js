import * as injectedScoringConfigurationRepository from '../../../shared/infrastructure/repositories/scoring-configuration-repository.js';
import { CapacitySimulator } from '../models/CapacitySimulator.js';

export async function simulateCapacityFromScore({
  score,
  date,
  scoringConfigurationRepository = injectedScoringConfigurationRepository,
} = {}) {
  const v3CertificationScoring = await scoringConfigurationRepository.getLatestByDateAndLocale({
    locale: 'fr-fr',
    date,
  });

  const certificationScoringIntervals = v3CertificationScoring.getIntervals();

  return CapacitySimulator.compute({
    score,
    certificationScoringIntervals,
    competencesForScoring: v3CertificationScoring.competencesForScoring,
  });
}
