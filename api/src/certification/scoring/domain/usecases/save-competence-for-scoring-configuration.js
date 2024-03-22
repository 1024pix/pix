/**
 * @typedef {import ('./index.js').scoringConfigurationRepository} ScoringConfigurationRepository
 */

/**
 * @param {Object} params
 * @param {ScoringConfigurationRepository} params.scoringConfigurationRepository
 */
const saveCompetenceForScoringConfiguration = async ({ data, userId, scoringConfigurationRepository }) => {
  await scoringConfigurationRepository.saveCompetenceForScoringConfiguration({ configuration: data, userId });
};

export { saveCompetenceForScoringConfiguration };
