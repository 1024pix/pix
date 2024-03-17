/**
 * @typedef {import ('./index.js').scoringConfigurationRepository} ScoringConfigurationRepository
 */

/**
 * @param {Object} params
 * @param {ScoringConfigurationRepository} params.scoringConfigurationRepository
 */
const saveCompetenceForScoringConfiguration = async ({ data, scoringConfigurationRepository }) => {
  await scoringConfigurationRepository.saveCompetenceForScoringConfiguration(data);
};

export { saveCompetenceForScoringConfiguration };
