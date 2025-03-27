import { NotFoundError } from '../../domain/errors.js';
import { Framework } from '../../domain/models/index.js';
import { child, SCOPES } from '../utils/logger.js';
import { LearningContentRepository } from './learning-content-repository.js';

const TABLE_NAME = 'learningcontent.frameworks';

const logger = child('learningcontent:repository', { event: SCOPES.LEARNING_CONTENT });

export async function list() {
  const cacheKey = 'list';
  const listCallback = (knex) => knex.orderBy('name');
  const frameworkDtos = await getInstance().find(cacheKey, listCallback);
  return frameworkDtos.map(toDomain);
}

export async function getByName(name) {
  const cacheKey = `getByName(${name})`;
  const findByNameCallback = (knex) => knex.where('name', name).limit(1);
  const [frameworkDto] = await getInstance().find(cacheKey, findByNameCallback);
  if (!frameworkDto) {
    logger.warn({ frameworkName: name }, 'Référentiel introuvable');
    throw new NotFoundError(`Framework not found for name ${name}`);
  }
  return toDomain(frameworkDto);
}

export async function findByRecordIds(ids) {
  const frameworkDtos = await getInstance().getMany(ids);
  return frameworkDtos
    .filter((frameworkDto) => frameworkDto)
    .sort(byName)
    .map(toDomain);
}

function toDomain(frameworkData) {
  return new Framework({
    id: frameworkData.id,
    name: frameworkData.name,
    areas: [],
  });
}

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
