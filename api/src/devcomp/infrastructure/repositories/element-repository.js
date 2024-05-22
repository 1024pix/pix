import { NotFoundError } from '../../../shared/domain/errors.js';
import { LearningContentResourceNotFound } from '../../../shared/infrastructure/datasources/learning-content/LearningContentResourceNotFound.js';
import { Module } from '../../domain/models/module/Module.js';

async function getByIdForAnswerVerification({ moduleId, elementId, moduleDatasource }) {
  let moduleData;
  try {
    moduleData = await moduleDatasource.getBySlug(moduleId);
  } catch (e) {
    if (e instanceof LearningContentResourceNotFound) {
      throw new NotFoundError();
    }
    throw e;
  }

  const foundElement = moduleData.grains
    .flatMap(({ components }) => components)
    .find((component) => component.type === 'element' && component.element.id === elementId);

  if (foundElement === undefined) {
    throw new NotFoundError();
  }

  const module = Module.toDomainForVerification(moduleData);
  const grain = module.getGrainByElementId(elementId);
  return grain.getElementById(elementId);
}

export { getByIdForAnswerVerification };
