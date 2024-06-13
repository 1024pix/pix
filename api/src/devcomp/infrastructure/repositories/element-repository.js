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
    .flatMap((component) => {
      if (component.type === 'element') {
        return component.element;
      } else if (component.type === 'stepper') {
        return component.steps.flatMap(({ elements }) => elements);
      }
    })
    .find((element) => {
      return element.id === elementId;
    });

  if (foundElement === undefined) {
    throw new NotFoundError();
  }

  const module = Module.toDomainForVerification(moduleData);
  const grain = module.getGrainByElementId(elementId);
  return grain.getElementById(elementId);
}

export { getByIdForAnswerVerification };
