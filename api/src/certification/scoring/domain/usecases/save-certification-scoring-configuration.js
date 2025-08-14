/**
 * @typedef {import('./index.js').ScoringConfigurationRepository} ScoringConfigurationRepository
 */

import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import * as injectedScoringConfigurationRepository from '../../../shared/infrastructure/repositories/scoring-configuration-repository.js';

export const saveCertificationScoringConfiguration = withTransaction(
  /**
   * @param {Object} params
   * @param {Object} params.configuration
   * @param {ScoringConfigurationRepository} params.scoringConfigurationRepository
   */
  async ({ configuration, scoringConfigurationRepository = injectedScoringConfigurationRepository } = {}) => {
    return scoringConfigurationRepository.saveCertificationScoringConfiguration({ configuration });
  },
);
