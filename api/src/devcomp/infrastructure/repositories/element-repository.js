import { NotFoundError } from '../../../shared/domain/errors.js';
import { ElementForVerificationFactory } from '../factories/element-for-verification-factory.js';

async function getByIdForAnswerVerification({ moduleId, elementId, moduleRepository }) {
  const moduleData = await moduleRepository.getById({ id: moduleId });

  const foundElement = flattenModuleElements(moduleData).find((element) => {
    return element.id === elementId;
  });

  if (foundElement === undefined) {
    throw new NotFoundError();
  }

  return ElementForVerificationFactory.build(foundElement);
}

function flattenModuleElements(moduleData) {
  return moduleData.sections
    .flatMap(({ grains }) => grains)
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
