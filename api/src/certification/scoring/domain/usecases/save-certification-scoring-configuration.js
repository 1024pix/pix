/**
 * @typedef {import ('./index.js').scoringConfigurationRepository} ScoringConfigurationRepository
 */

/**
 * @param {Object} params
 * @param {ScoringConfigurationRepository} params.scoringConfigurationRepository
 */
const saveCertificationScoringConfiguration = async ({ data, scoringConfigurationRepository }) => {
  return scoringConfigurationRepository.saveCertificationScoringConfiguration({ configuration: data });
};

export { saveCertificationScoringConfiguration };
