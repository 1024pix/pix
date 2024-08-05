import { NotFoundError } from '../../../shared/domain/errors.js';
import { LearningContentResourceNotFound } from '../../../shared/infrastructure/datasources/learning-content/LearningContentResourceNotFound.js';
import { ElementForVerificationFactory } from '../factories/element-for-verification-factory.js';

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

  const foundElement = flattenModuleElements(moduleData).find((element) => {
    return element.id === elementId;
  });

  if (foundElement === undefined) {
    throw new NotFoundError();
  }

  return ElementForVerificationFactory.build(foundElement);
}

function flattenModuleElements(moduleData) {
  return moduleData.grains
    .flatMap(({ components }) => components)
    .flatMap((component) => {
      if (component.type === 'element') {
        return component.element;
      } else if (component.type === 'stepper') {
        return component.steps.flatMap(({ elements }) => elements);
      }
    });
}

export { flattenModuleElements, getByIdForAnswerVerification };
