import crypto from 'node:crypto';

import { NotFoundError } from '../../../shared/domain/errors.js';
import { makeGetInstance } from '../../../shared/infrastructure/repositories/learning-content-repository.ts';
import { ModuleFactory } from '../factories/module-factory.js';

const TABLE_NAME = 'learningcontent.modules';

export const getInstance = makeGetInstance({ tableName: TABLE_NAME, idType: 'uuid' });

async function getById({ id }) {
  const module = await getInstance().load(id);
  if (!module) {
    throw new NotFoundError();
  }

  return toDomainFromDbObject(module);
}

async function getByShortId({ shortId }) {
  const cacheKey = `getByShortId(${shortId})`;
  const findByShortIdCallback = (knex) => knex.where('shortId', shortId).limit(1);

  const [module] = await getInstance().find(cacheKey, findByShortIdCallback);

  if (!module) {
    throw new NotFoundError();
  }

  return toDomainFromDbObject(module);
}

async function getBySlug({ slug }) {
  const cacheKey = `getBySlug(${slug})`;
  const findBySlugCallback = (knex) => knex.where('slug', slug).limit(1);

  const [module] = await getInstance().find(cacheKey, findBySlugCallback);

  if (!module) {
    throw new NotFoundError();
  }

  return toDomainFromDbObject(module);
}

async function list() {
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

async function toDomainFromDbObject({ image, description, duration, level, tabletSupport, objectives, ...moduleRest }) {
  return toDomain({ ...moduleRest, details: { image, description, duration, level, tabletSupport, objectives } });
}

async function toDomain(moduleData) {
  const version = _computeModuleVersion(moduleData);
  return ModuleFactory.build({ ...moduleData, version });
}

export function clearCache(id) {
  return getInstance().clearCache?.(id);
}
