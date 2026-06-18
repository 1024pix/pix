/**
 * @typedef {import ('../../../shared/domain/models/ComplementaryCertificationKeys.js').ComplementaryCertificationKeys} ComplementaryCertificationKeys
 * @typedef {import ('./index.js').VersionRepository} VersionRepository
 */
import { Frameworks } from '../../../shared/domain/models/Frameworks.js';

/**
 * @param {object} params
 * @param {Framework} params.framework
 * @param {VersionRepository} params.versionRepository
 */
export async function getFrameworkHistory({ framework, versionRepository }) {
  if (framework === Frameworks.CLEA) {
    return [];
  }
  return versionRepository.getFrameworkHistory({ scope: framework });
}
