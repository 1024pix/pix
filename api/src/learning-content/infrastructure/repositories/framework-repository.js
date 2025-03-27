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

/**
 * @function
 * @name findByNames
 *
 * @param {Object} params
 * @param {Array<string>} params.names
 * @returns {Promise<Array<FrameworkFromDB>>}
 * @throws {NotFoundError} name does not refer to an existing framework
 */
export async function findByNames({ names }) {
  const frameworkModels = [];
  for (const name of names) {
    frameworkModels.push(await frameworkRepository.getByName(name));
  }
  return frameworkModels.map((frameworkModel) => ({
    id: frameworkModel.id,
    name: frameworkModel.name,
  }));
}
