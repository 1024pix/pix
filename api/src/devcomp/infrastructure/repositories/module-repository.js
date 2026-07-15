import crypto from 'node:crypto';

import { LearningContentResourceNotFound, NotFoundError } from '../../../shared/domain/errors.js';
import { featureToggles } from '../../../shared/infrastructure/feature-toggles/index.js';
import { LearningContentRepository } from '../../../shared/infrastructure/repositories/learning-content-repository.js';
import { ModuleDoesNotExistError } from '../../domain/errors.js';
import { ModuleFactory } from '../factories/module-factory.js';

const isFetchingModulesFromLearningContentEnabled = featureToggles.use('isFetchingModulesFromLearningContentEnabled');

async function getById({ id, moduleDatasource }) {
  if (!isFetchingModulesFromLearningContentEnabled.value) {
    return _getModuleFromDatasource({ ref: 'id', moduleDatasource, query: id });
  }

  const module = await getInstance().load(id);
  if (!module) {
    throw new NotFoundError();
  }

  return toDomainFromDbObject(module);
}

async function getByShortId({ shortId, moduleDatasource }) {
  if (!isFetchingModulesFromLearningContentEnabled.value) {
    return await _getModuleFromDatasource({ ref: 'shortId', moduleDatasource, query: shortId });
  }

  const cacheKey = `getByShortId(${shortId})`;
  const findByShortIdCallback = (knex) => knex.where('shortId', shortId).limit(1);

  const [module] = await getInstance().find(cacheKey, findByShortIdCallback);

  if (!module) {
    throw new NotFoundError();
  }

  return toDomainFromDbObject(module);
}

async function getBySlug({ slug, moduleDatasource }) {
  if (!isFetchingModulesFromLearningContentEnabled.value) {
    return await _getModuleFromDatasource({ ref: 'slug', moduleDatasource, query: slug });
  }

  const cacheKey = `getBySlug(${slug})`;
  const findBySlugCallback = (knex) => knex.where('slug', slug).limit(1);

  const [module] = await getInstance().find(cacheKey, findBySlugCallback);

  if (!module) {
    throw new NotFoundError();
  }

  return toDomainFromDbObject(module);
}

async function list({ moduleDatasource } = {}) {
  if (!isFetchingModulesFromLearningContentEnabled.value) {
    const modulesData = await moduleDatasource.list();
    return Promise.all(modulesData.map(async (moduleData) => await ModuleFactory.build(moduleData)));
  }

  const cacheKey = 'list';
  const listCallback = (knex) => knex.orderBy('slug');

  const modules = await getInstance().find(cacheKey, listCallback);

  return Promise.all(modules.map(toDomainFromDbObject));
}

export { getById, getByShortId, getBySlug, list };

function _computeModuleVersion(moduleData) {
  if ('version' in moduleData) return moduleData.version;
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(moduleData));
  return hash.copy().digest('hex');
}

async function _getModuleFromDatasource({ ref, moduleDatasource, query }) {
  try {
    const method = getModuleMethod(ref, moduleDatasource);
    const moduleData = await method(query);

    return await toDomain(moduleData);
  } catch (error) {
    if (error instanceof LearningContentResourceNotFound || error instanceof ModuleDoesNotExistError) {
      throw new NotFoundError();
    }
    throw error;
  }
}

async function toDomainFromDbObject({ image, description, duration, level, tabletSupport, objectives, ...moduleRest }) {
  return toDomain({ ...moduleRest, details: { image, description, duration, level, tabletSupport, objectives } });
}

async function toDomain(moduleData) {
  const version = _computeModuleVersion(moduleData);
  return ModuleFactory.build({ ...moduleData, version });
}

function getModuleMethod(ref, moduleDatasource) {
  switch (ref) {
    case 'slug':
      return moduleDatasource.getBySlug;
    case 'shortId':
      return moduleDatasource.getByShortId;
    case 'id':
      return moduleDatasource.getById;
    default:
      return moduleDatasource.getById;
  }
}

export function clearCache(id) {
  return getInstance().clearCache(id);
}

const TABLE_NAME = 'learningcontent.modules';

/** @type {LearningContentRepository} */
let instance;

function getInstance() {
  if (!instance) {
    instance = new LearningContentRepository({ tableName: TABLE_NAME, idType: 'uuid' });
  }
  return instance;
}
