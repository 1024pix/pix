import * as frameworkRepository from '../../../shared/infrastructure/repositories/framework-repository.js';
/**
 * @typedef FrameworkFromDB
 * @type {object}
 * @property {string} id
 * @property {string} name
 */

/**
 * @function
 * @name list
 *
 * @returns {Promise<Array<FrameworkFromDB>>}
 */
export async function list() {
  const frameworkModels = await frameworkRepository.list();
  return frameworkModels.map((frameworkModel) => ({
    id: frameworkModel.id,
    name: frameworkModel.name,
  }));
}
