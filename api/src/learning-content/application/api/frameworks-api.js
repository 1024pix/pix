import * as frameworkRepository from '../../infrastructure/repositories/framework-repository.js';
import { FrameworkDTO } from './models/FrameworkDTO.js';

/**
 * @typedef {import ('./models/FrameworkDTO.js').FrameworkDTO} FrameworkDTO
 * @type {object}
 * @property {string} id
 * @property {string} name
 */

/**
 * @function
 * @name list
 *
 * @returns {Promise<Array<FrameworkDTO>>}
 */
export async function list() {
  const frameworks = await frameworkRepository.list();
  return frameworks.map(toApi);
}

const toApi = (framework) => new FrameworkDTO(framework);
