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

async function getByShortId({ shortId, moduleDatasource }) {
  try {
    const module = await moduleDatasource.getByShortId(shortId);
    return _toDomain(module);
  } catch (error) {
    throw new NotFoundError(error.message);
  }
}

async function getBySlug({ slug, moduleDatasource }) {
  try {
    const module = await moduleDatasource.getBySlug(slug);
    return _toDomain(module);
  } catch (error) {
    throw new NotFoundError(error.message);
  }
}

async function listPublic({ moduleDatasource }) {
  const modules = await moduleDatasource.list();
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
