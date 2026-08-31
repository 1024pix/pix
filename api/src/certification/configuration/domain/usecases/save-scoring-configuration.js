import { NotFoundError } from '../../../../shared/domain/errors.js';

/**
 * @param {object} params
 * @param {number} params.id
 * @param {Array} params.globalScoringConfiguration
 * @param {Array|null} params.competencesScoringConfiguration
 * @param {object} params.versionRepository
 */
export async function saveScoringConfiguration({
  id,
  globalScoringConfiguration,
  competencesScoringConfiguration,
  versionRepository,
}) {
  const version = await versionRepository.getById({ id });

  if (!version) {
    throw new NotFoundError(`No certification version found for id: ${id}`);
  }

  await versionRepository.updateScoring({ id, globalScoringConfiguration, competencesScoringConfiguration });
}
