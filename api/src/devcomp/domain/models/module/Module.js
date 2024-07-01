import { NotFoundError } from '../../../../shared/domain/errors.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { ModuleInstantiationError } from '../../errors.js';
import { ComponentElement } from '../component/ComponentElement.js';
import { QCMForAnswerVerification } from '../element/QCM-for-answer-verification.js';
import { QCUForAnswerVerification } from '../element/QCU-for-answer-verification.js';
import { QROCMForAnswerVerification } from '../element/QROCM-for-answer-verification.js';
import { Grain } from '../Grain.js';
import { QcmProposal } from '../QcmProposal.js';
import { QcuProposal } from '../QcuProposal.js';
import { TransitionText } from '../TransitionText.js';
import { Details } from './Details.js';

class Module {
  constructor({ id, slug, title, grains, details, transitionTexts = [] }) {
    assertNotNullOrUndefined(id, 'The id is required for a module');
    assertNotNullOrUndefined(title, 'The title is required for a module');
    assertNotNullOrUndefined(slug, 'The slug is required for a module');
    assertNotNullOrUndefined(grains, 'A list of grains is required for a module');
    this.#assertGrainsIsAnArray(grains);
    assertNotNullOrUndefined(details, 'The details are required for a module');
    this.#assertTransitionTextsLinkedToGrain(transitionTexts, grains);

    this.id = id;
    this.slug = slug;
    this.title = title;
    this.grains = grains;
    this.transitionTexts = transitionTexts;
    this.details = details;
  }

  static toDomainForVerification(moduleData) {
    try {
      return new Module({
        id: moduleData.id,
        slug: moduleData.slug,
        title: moduleData.title,
        details: new Details(moduleData.details),
        transitionTexts: moduleData.transitionTexts?.map((transitionText) => new TransitionText(transitionText)) ?? [],
        grains: moduleData.grains.map((grain) => {
          return new Grain({
            id: grain.id,
            title: grain.title,
            type: grain.type,
            components: grain.components
              .flatMap((component) => {
                switch (component.type) {
                  case 'element': {
                    const element = Module.#mapElementForVerification(component.element);
                    if (element) {
                      return new ComponentElement({ element });
                    } else {
                      return undefined;
                    }
                  }
                  case 'stepper':
                    return component.steps.flatMap((step) => {
                      return step.elements
                        .flatMap((element) => {
                          const domainElement = Module.#mapElementForVerification(element);
                          if (domainElement) {
                            return domainElement;
                          } else {
                            return undefined;
                          }
                        })
                        .filter((element) => element !== undefined)
                        .map((element) => {
                          return new ComponentElement({ element });
                        });
                    });
                  default:
                    logger.warn({
                      event: 'module_component_type_unknown',
                      message: `Component inconnu: ${component.type}`,
                    });
                    return undefined;
                }
              })
              .filter((component) => component !== undefined),
          });
        }),
      });
    } catch (e) {
      throw new ModuleInstantiationError(e.message);
    }
  }

  static #mapElementForVerification(element) {
    switch (element.type) {
      case 'qcm':
        return Module.#toQCMForAnswerVerificationDomain(element);
      case 'qcu':
        return Module.#toQCUForAnswerVerificationDomain(element);
      case 'qrocm':
        return Module.#toQROCMForAnswerVerificationDomain(element);
      default:
        logger.warn({
          event: 'module_element_type_not_handled_for_verification',
          message: `Element type not handled for verification: ${element.type}`,
        });
        return undefined;
    }
  }

  #assertTransitionTextsLinkedToGrain(transitionTexts, grains) {
    const isTransitionTextsLinkedToGrain = transitionTexts.every(
      ({ grainId }) => !!grains.find(({ id }) => grainId === id),
    );
    if (!isTransitionTextsLinkedToGrain) {
      throw new Error('All the transition texts should be linked to a grain contained in the module.');
    }
  }

  #assertGrainsIsAnArray(grains) {
    if (!Array.isArray(grains)) {
      throw new Error('A module should have a list of grains');
    }
  }

  getGrainByElementId(elementId) {
    const foundGrain = this.grains.find((grain) => {
      const componentElements = grain.components.filter((component) => component.type === 'element');
      const isElementFound = componentElements.some(({ element }) => element.id === elementId);

      return isElementFound;
    });

    if (foundGrain === undefined) {
      throw new NotFoundError();
    }

    return foundGrain;
  }

  static #toQCUForAnswerVerificationDomain(element) {
    return new QCUForAnswerVerification({
      id: element.id,
      instruction: element.instruction,
      locales: element.locales,
      proposals: element.proposals.map((proposal) => {
        return new QcuProposal({
          id: proposal.id,
          content: proposal.content,
        });
      }),
      feedbacks: element.feedbacks,
      solution: element.solution,
    });
  }

  static #toQCMForAnswerVerificationDomain(element) {
    return new QCMForAnswerVerification({
      id: element.id,
      instruction: element.instruction,
      locales: element.locales,
      proposals: element.proposals.map((proposal) => {
        return new QcmProposal({
          id: proposal.id,
          content: proposal.content,
        });
      }),
      feedbacks: element.feedbacks,
      solutions: element.solutions,
    });
  }

  static #toQROCMForAnswerVerificationDomain(element) {
    return new QROCMForAnswerVerification({
      id: element.id,
      instruction: element.instruction,
      locales: element.locales,
      proposals: element.proposals,
      feedbacks: element.feedbacks,
    });
  }
}

export { Module };
