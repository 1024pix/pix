import { CapacitySimulator } from '../models/CapacitySimulator.js';

export async function simulateCapacityFromScore({ score, date, scoringConfigurationRepository }) {
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
