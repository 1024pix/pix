import { NotFoundError } from '../../../shared/domain/errors.js';
import { LearningContentResourceNotFound } from '../../../shared/infrastructure/datasources/learning-content/LearningContentResourceNotFound.js';
import { Module } from '../../domain/models/module/Module.js';
import { ModuleFactory } from '../factories/module-factory.js';

async function getBySlug({ slug, moduleDatasource }) {
  try {
    const moduleData = await moduleDatasource.getBySlug(slug);

    return ModuleFactory.toDomain(moduleData);
  } catch (e) {
    if (e instanceof LearningContentResourceNotFound) {
      throw new NotFoundError();
    }
    throw e;
  }
}

async function getBySlugForVerification({ slug, moduleDatasource }) {
  try {
    const moduleData = await moduleDatasource.getBySlug(slug);

    return Module.toDomainForVerification(moduleData);
  } catch (e) {
    if (e instanceof LearningContentResourceNotFound) {
      throw new NotFoundError();
    }
    throw e;
  }
}

export { getBySlug, getBySlugForVerification };
