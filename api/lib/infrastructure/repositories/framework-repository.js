import { config } from '../../../src/shared/config.js';
import { NotFoundError } from '../../../src/shared/domain/errors.js';
import { Framework } from '../../../src/shared/domain/models/index.js';
import { LearningContentRepository } from '../../../src/shared/infrastructure/repositories/learning-content-repository.js';
import * as oldFrameworkRepository from './framework-repository_old.js';

const TABLE_NAME = 'learningcontent.frameworks';

export async function list() {
  if (!config.featureToggles.useNewLearningContent) return oldFrameworkRepository.list();
  const cacheKey = 'list';
  const listCallback = (knex) => knex.orderBy('name');
  const frameworkDtos = await getInstance().find(cacheKey, listCallback);
  return frameworkDtos.map(toDomain);
}

export async function getByName(name) {
  if (!config.featureToggles.useNewLearningContent) return oldFrameworkRepository.getByName(name);
  const cacheKey = `getByName(${name})`;
  const findByNameCallback = (knex) => knex.where('name', name).limit(1);
  const [frameworkDto] = await getInstance().find(cacheKey, findByNameCallback);
  if (!frameworkDto) {
    throw new NotFoundError(`Framework not found for name ${name}`);
  }
  return toDomain(frameworkDto);
}

export async function findByRecordIds(ids) {
  if (!config.featureToggles.useNewLearningContent) return oldFrameworkRepository.findByRecordIds(ids);
  const frameworkDtos = await getInstance().loadMany(ids);
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
