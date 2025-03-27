import { NotFoundError } from '../../../shared/domain/errors.js';
import { LearningContentRepository } from '../../../shared/infrastructure/repositories/learning-content-repository.js';
import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';

const TABLE_NAME = 'learningcontent.frameworks';
const logger = child('learningcontent:repository', { event: SCOPES.LEARNING_CONTENT });

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
  const cacheKey = 'list';
  const listCallback = (knex) => knex.orderBy('name');
  return getInstance().find(cacheKey, listCallback);
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
  const frameworksFromDB = [];
  for (const name of names) {
    const cacheKey = `getByName(${name})`;
    const findByNameCallback = (knex) => knex.where('name', name).limit(1);
    const [frameworkFromDB] = await getInstance().find(cacheKey, findByNameCallback);
    if (!frameworkFromDB) {
      logger.warn({ frameworkName: name }, 'Référentiel introuvable');
      throw new NotFoundError(`Framework not found for name ${name}`);
    }
    frameworksFromDB.push(frameworkFromDB);
  }
  return frameworksFromDB;
}

/**
 * @function
 * @name findByIds
 *
 * @param {Object} params
 * @param {Array<string>} params.ids
 * @returns {Promise<Array<FrameworkFromDB>>}
 */
export async function findByIds({ ids }) {
  const frameworksFromDB = await getInstance().getMany(ids);
  return frameworksFromDB.filter((frameworkFromDB) => frameworkFromDB).sort(byName);
}

/**
 * @function
 * @name clearCache
 *
 * @param {string} id
 * @returns {Promise<void>}
 */
export function clearCache(id) {
  return getInstance().clearCache(id);
}

const collator = new Intl.Collator('fr', { usage: 'sort' });

function byName(framework1, framework2) {
  return collator.compare(framework1.name, framework2.name);
}

/** @type {LearningContentRepository} */
let instance;

function getInstance() {
  if (!instance) {
    instance = new LearningContentRepository({ tableName: TABLE_NAME });
  }
  return instance;
}
