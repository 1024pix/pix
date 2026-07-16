import { usecases } from '../../domain/usecases/index.js';
import LearningContentDTO from './models/LearningContentDTO.js';

/**
 * @param {{ tubeIds: string[], locale: string }}
 */
export async function findByTubeIds({ tubeIds = [], locale }) {
  const frameworks = await usecases.getLearningContentByTubeIds({ tubeIds, locale });
  return frameworks.map((framework) => new LearningContentDTO(framework));
}
