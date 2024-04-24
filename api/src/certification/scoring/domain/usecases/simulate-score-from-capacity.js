import { ScoringSimulator } from '../models/ScoringSimulator.js';

export async function simulateScoreFromCapacity({ capacity, date, scoringConfigurationRepository }) {
  const v3CertificationScoring = await scoringConfigurationRepository.getLatestByDateAndLocale({
    locale: 'fr-fr',
    date,
  });

  const certificationScoringIntervals = v3CertificationScoring.getIntervals();

  return ScoringSimulator.compute({
    capacity,
    certificationScoringIntervals,
    competencesForScoring: v3CertificationScoring.competencesForScoring,
  });
}
