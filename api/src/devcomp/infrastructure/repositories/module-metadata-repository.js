import { NotFoundError } from '../../../shared/domain/errors.js';
import { LearningContentRepository } from '../../../shared/infrastructure/repositories/learning-content-repository.js';
import { Module } from '../../domain/models/module/Module.js';
import { ModuleMetadata } from '../../domain/models/module/ModuleMetadata.js';

const TABLE_NAME = 'learningcontent.modules';

/** @type {LearningContentRepository} */
let instance;

function getInstance() {
  if (!instance) {
    instance = new LearningContentRepository({ tableName: TABLE_NAME, idType: 'uuid' });
  }
  return instance;
}

async function getAllByIds({ ids }) {
  const modules = await getInstance().loadMany(ids);
  const notFoundIds = ids.filter((id, index) => !modules[index]);
  if (notFoundIds.length > 0) {
    throw new NotFoundError(`Modules with ids not found : ${notFoundIds}`);
  }
  return modules.map(_toDomain);
}

async function getAllByShortIds({ shortIds }) {
  const cacheKey = `getAllByShortIds(${shortIds})`;
  const findByShortIdsCallback = (knex) => knex.whereIn('shortId', shortIds);

  const modules = await getInstance().find(cacheKey, findByShortIdsCallback);
  const foundShortIds = modules.map((module) => module.shortId);
  const notFoundShortIds = shortIds.filter((shortId) => !foundShortIds.includes(shortId));
  if (notFoundShortIds.length > 0) {
    throw new NotFoundError(`Modules with shortIds not found : ${notFoundShortIds}`);
  }
  return modules.map(_toDomain);
}

async function getByShortId({ shortId }) {
  const cacheKey = `getByShortId(${shortId})`;
  const findByShortIdCallback = (knex) => knex.where('shortId', shortId).limit(1);

  const [module] = await getInstance().find(cacheKey, findByShortIdCallback);
  if (!module) {
    throw new NotFoundError(`Module with shortId ${shortId} not found`);
  }
  return _toDomain(module);
}

async function getBySlug({ slug }) {
  const cacheKey = `getBySlug(${slug})`;
  const findBySlugCallback = (knex) => knex.where('slug', slug).limit(1);

  const [module] = await getInstance().find(cacheKey, findBySlugCallback);
  if (!module) {
    throw new NotFoundError(`Module with slug ${slug} not found`);
  }
  return _toDomain(module);
}

async function listPublic() {
  const cacheKey = 'list';
  const listCallback = (knex) => knex.orderBy('slug');

  const modules = await getInstance().find(cacheKey, listCallback);
  const publicModules = modules.filter((module) => module.visibility === Module.VISIBILITY.PUBLIC);
  return publicModules.map(_toDomain);
}

function _toDomain({ id, shortId, slug, title, isBeta, duration, image, visibility }) {
  return new ModuleMetadata({
    id,
    shortId,
    slug,
    title,
    isBeta,
    duration,
    image,
    visibility,
  });
}

export { getAllByIds, getAllByShortIds, getByShortId, getBySlug, listPublic };
