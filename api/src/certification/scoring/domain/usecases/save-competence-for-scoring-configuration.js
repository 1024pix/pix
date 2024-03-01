/**
 * @typedef {import ('./index.js').CompetenceForScoringRepository} CompetenceForScoringRepository
 */

/**
 * @param {Object} params
 * @param {CompetenceForScoringRepository} params.competenceForScoringRepository
 */
const saveCompetenceForScoringConfiguration = async ({ data, competenceForScoringRepository }) => {
  await competenceForScoringRepository.save(data);
};

export { saveCompetenceForScoringConfiguration };
