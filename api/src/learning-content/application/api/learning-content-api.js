import { FRENCH_SPOKEN } from '../../../shared/domain/services/locale-service.js';
import { NoTubesProvidedError, SomeTubesNotFoundError } from '../../domain/errors.js';
import { findByTubeIds as findLearningContentViewByTubeIds } from '../../infrastructure/repositories/learning-content-view-repository.js';
import { LearningContentDTO } from './models/LearningContentDTO.js';

/**
 * @typedef {object} NoTubesProvidedResult
 * @property {NoTubesProvidedError} error
 * @property {null} learningContentDTO
 */

/**
 * @typedef {object} SomeTubesNotFoundResult
 * @property {SomeTubesNotFoundError} error
 * @property {LearningContentDTO} learningContentDTO
 */

/**
 * @typedef {object} AllTubesFoundResult
 * @property {null} error
 * @property {LearningContentDTO} learningContentDTO
 */

class LearningContentResult {
  constructor({ learningContentDTO, error }) {
    this.learningContentDTO = learningContentDTO;
    this.error = error;
  }
}

/**
 * @example
 * const { learningContentDTO, error } = await learningContentAPI.findByTubeIds({ tubeIds });
 * if (error instanceof learningContentAPI.NoTubesProvidedError) {
 *   throw new MyDomainError(error.message);
 * }
 * if (error instanceof learningContentAPI.SomeTubesNotFoundError) {
 *   logger.error({ missingTubeIds: error.missingTubeIds }, '...');
 *   // handle the error report in your own way,
 *   // learningContentDTO.frameworkDTOs will still contain some results
 * }
 * for (const frameworkDTO of learningContentDTO.frameworkDTOs) { ... }
 *
 *
 * @param {Object} params
 * @param {Array<string>} params.tubeIds
 * @param {string} params.locale default to FRENCH_SPOKEN
 * @returns {Promise<AllTubesFoundResult | SomeTubesNotFoundResult | NoTubesProvidedResult>}
 */
export async function findByTubeIds({ tubeIds = [], locale = FRENCH_SPOKEN }) {
  if (!tubeIds?.length) {
    return new LearningContentResult({
      learningContentDTO: null,
      error: new NoTubesProvidedError(),
    });
  }

  const learningContentView = await findLearningContentViewByTubeIds(tubeIds);

  const foundTubeIds = learningContentView.frameworkViews
    .flatMap((framework) =>
      framework.areaViews
        .flatMap((area) => area.competenceViews)
        .flatMap((competence) => competence.thematicViews)
        .flatMap((thematic) => thematic.tubeViews),
    )
    .map((tube) => tube.id);

  const missingTubeIdsSet = new Set(tubeIds).difference(new Set(foundTubeIds));
  if (missingTubeIdsSet.size > 0 && missingTubeIdsSet.size !== tubeIds.length) {
    return new LearningContentResult({
      learningContentDTO: LearningContentDTO.buildFromView(learningContentView, locale),
      error: new SomeTubesNotFoundError(Array.from(missingTubeIdsSet.values())),
    });
  }

  return new LearningContentResult({
    learningContentDTO: LearningContentDTO.buildFromView(learningContentView, locale),
    error: null,
  });
}

export { NoTubesProvidedError, SomeTubesNotFoundError };
