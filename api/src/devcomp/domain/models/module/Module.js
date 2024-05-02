import { NotFoundError } from '../../../../shared/domain/errors.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { ModuleInstantiationError } from '../../errors.js';
import { BlockInput } from '../block/BlockInput.js';
import { BlockSelect } from '../block/BlockSelect.js';
import { BlockSelectOption } from '../block/BlockSelectOption.js';
import { BlockText } from '../block/BlockText.js';
import { ComponentElement } from '../ComponentElement.js';
import { Image } from '../element/Image.js';
import { QCM } from '../element/QCM.js';
import { QCMForAnswerVerification } from '../element/QCM-for-answer-verification.js';
import { QCU } from '../element/QCU.js';
import { QCUForAnswerVerification } from '../element/QCU-for-answer-verification.js';
import { QROCM } from '../element/QROCM.js';
import { QROCMForAnswerVerification } from '../element/QROCM-for-answer-verification.js';
import { Text } from '../element/Text.js';
import { Video } from '../element/Video.js';
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

  static toDomain(moduleData) {
    try {
      return new Module({
        id: moduleData.id,
        slug: moduleData.slug,
        title: moduleData.title,
        transitionTexts: moduleData.transitionTexts?.map((transitionText) => new TransitionText(transitionText)) ?? [],
        details: new Details(moduleData.details),
        grains: moduleData.grains.map((grain) => {
          if (grain.components) {
            // ToDo PIX-12363 migrate to components
            if (!grain.elements) {
              throw new Error('Elements should always be provided');
            }

            return new Grain({
              id: grain.id,
              title: grain.title,
              type: grain.type,
              elements: grain.elements.map(Module.#mapElement).filter((element) => element !== undefined),
              components: grain.components
                .map((component) => {
                  if (component.type === 'element') {
                    const element = Module.#mapElement(component.element);
                    if (element) {
                      return new ComponentElement({ element });
                    } else {
                      return undefined;
                    }
                  } else {
                    logger.warn({
                      event: 'module_component_type_unknown',
                      message: `Component inconnu: ${component.type}`,
                    });
                    return undefined;
                  }
                })
                .filter((component) => component !== undefined),
            });
          } else {
            return new Grain({
              id: grain.id,
              title: grain.title,
              type: grain.type,
              elements: grain.elements.map(Module.#mapElement).filter((element) => element !== undefined),
            });
          }
        }),
      });
    } catch (e) {
      throw new ModuleInstantiationError(e.message);
    }
  }
  static #mapElement(element) {
    switch (element.type) {
      case 'image':
        return Module.#toImageDomain(element);
      case 'text':
        return Module.#toTextDomain(element);
      case 'qcm':
        return Module.#toQCMDomain(element);
      case 'qcu':
        return Module.#toQCUDomain(element);
      case 'qrocm':
        return Module.#toQROCMDomain(element);
      case 'video':
        return Module.#toVideoDomain(element);
      default:
        logger.warn({
          event: 'module_element_type_unknown',
          message: `Element inconnu: ${element.type}`,
        });
        return undefined;
    }
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
            // ToDo PIX-12363 migrate to components
            elements: grain.elements
              .map((element) => {
                switch (element.type) {
                  case 'image':
                    return Module.#toImageDomain(element);
                  case 'text':
                    return Module.#toTextDomain(element);
                  case 'qcu':
                    return Module.#toQCUForAnswerVerificationDomain(element);
                  case 'qcm':
                    return Module.#toQCMForAnswerVerificationDomain(element);
                  case 'qrocm':
                    return Module.#toQROCMForAnswerVerificationDomain(element);
                  case 'video':
                    return Module.#toVideoDomain(element);
                  default:
                    logger.warn({
                      event: 'module_element_type_unknown',
                      message: `Element inconnu: ${element.type}`,
                    });
                    return undefined;
                }
              })
              .filter((element) => element !== undefined),
          });
        }),
      });
    } catch (e) {
      throw new ModuleInstantiationError(e.message);
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
      // ToDo PIX-12363 migrate to components
      const isElementFound = grain.elements.some((element) => element.id === elementId);

      return isElementFound;
    });

    if (foundGrain === undefined) {
      throw new NotFoundError();
    }

    return foundGrain;
  }

  static #toTextDomain(element) {
    return new Text({
      id: element.id,
      content: element.content,
    });
  }

  static #toImageDomain(element) {
    return new Image({
      id: element.id,
      url: element.url,
      alt: element.alt,
      alternativeText: element.alternativeText,
    });
  }

  static #toVideoDomain(element) {
    return new Video({
      id: element.id,
      title: element.title,
      url: element.url,
      subtitles: element.subtitles,
      transcription: element.transcription,
    });
  }

  static #toQCUDomain(element) {
    return new QCU({
      id: element.id,
      instruction: element.instruction,
      locales: element.locales,
      proposals: element.proposals.map((proposal) => {
        return new QcuProposal({
          id: proposal.id,
          content: proposal.content,
        });
      }),
    });
  }

  static #toQCMDomain(element) {
    return new QCM({
      id: element.id,
      instruction: element.instruction,
      locales: element.locales,
      proposals: element.proposals.map((proposal) => {
        return new QcmProposal({
          id: proposal.id,
          content: proposal.content,
        });
      }),
    });
  }

  static #toQROCMDomain(element) {
    return new QROCM({
      id: element.id,
      instruction: element.instruction,
      locales: element.locales,
      proposals: element.proposals.map((proposal) => {
        switch (proposal.type) {
          case 'text':
            return new BlockText(proposal);
          case 'input':
            return new BlockInput(proposal);
          case 'select':
            return new BlockSelect({
              ...proposal,
              options: proposal.options.map((option) => new BlockSelectOption(option)),
            });
          default:
            logger.warn(`Type de proposal inconnu: ${proposal.type}`);
        }
      }),
    });
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
