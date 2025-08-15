import { saveCertificationScoringConfiguration } from './save-certification-scoring-configuration.js';
import { saveCompetenceForScoringConfiguration } from './save-competence-for-scoring-configuration.js';
import { simulateCapacityFromScore } from './simulate-capacity-from-score.js';
import { simulateScoreFromCapacity } from './simulate-score-from-capacity.js';

const usecases = {
  saveCertificationScoringConfiguration,
  saveCompetenceForScoringConfiguration,
  simulateCapacityFromScore,
  simulateScoreFromCapacity,
};

export { usecases };
