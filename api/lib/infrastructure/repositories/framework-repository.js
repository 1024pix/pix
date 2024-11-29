import { NotFoundError } from '../../../src/shared/domain/errors.js';
import { Framework } from '../../../src/shared/domain/models/index.js';
import { LearningContentRepository } from '../../../src/shared/infrastructure/repositories/learning-content-repository.js';

const TABLE_NAME = 'learningcontent.frameworks';

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
    throw new NotFoundError(`Framework not found for name ${name}`);
  }
  return toDomain(frameworkDto);
}

export async function findByRecordIds(ids) {
  const frameworkDtos = await getInstance().loadMany(ids);
  return frameworkDtos
    .filter((frameworkDto) => frameworkDto)
    .sort(byId)
    .map(toDomain);
}

export function clear() {
  return getInstance().clear();
}

function toDomain(frameworkData) {
  return new Framework({
    id: frameworkData.id,
    name: frameworkData.name,
    areas: [],
  });
}

export function clearCache() {
  return getInstance().clearCache();
}

function byId(entityA, entityB) {
  return entityA.id < entityB.id ? -1 : 1;
}

/** @type {LearningContentRepository} */
let instance;

function getInstance() {
  if (!instance) {
    instance = new LearningContentRepository({ tableName: TABLE_NAME });
  }
  return instance;
}
