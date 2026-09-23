import { NotFoundError } from '../../../shared/domain/errors.js';
import { Module } from '../../domain/models/module/Module.js';
import { ModuleMetadata } from '../../domain/models/module/ModuleMetadata.js';

async function getAllByIds({ ids, moduleDatasource }) {
  try {
    const modules = await moduleDatasource.getAllByIds(ids);
    return modules.map(_toDomain);
  } catch (error) {
    throw new NotFoundError(error.message);
  }
}

async function getAllByShortIds({ shortIds, moduleDatasource }) {
  try {
    const modules = await moduleDatasource.getAllByShortIds(shortIds);
    return modules.map(_toDomain);
  } catch (error) {
    throw new NotFoundError(error.message);
  }
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

function _toDomain(module) {
  const { id, shortId, slug, title, isBeta, details, visibility } = module;
  return new ModuleMetadata({
    id,
    shortId,
    slug,
    title,
    isBeta,
    duration: details.duration,
    image: details.image,
    visibility,
    level: details.level,
    description: details.description,
    objectives: details.objectives,
  });
}

export { getAllByIds, getAllByShortIds, getByShortId, getBySlug, listPublic };
