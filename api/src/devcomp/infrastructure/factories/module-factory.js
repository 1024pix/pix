import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { ModuleInstantiationError } from '../../domain/errors.js';
import { BlockInput } from '../../domain/models/block/BlockInput.js';
import { BlockSelect } from '../../domain/models/block/BlockSelect.js';
import { BlockSelectOption } from '../../domain/models/block/BlockSelectOption.js';
import { BlockText } from '../../domain/models/block/BlockText.js';
import { ComponentElement } from '../../domain/models/component/ComponentElement.js';
import { ComponentStepper } from '../../domain/models/component/ComponentStepper.js';
import { Step } from '../../domain/models/component/Step.js';
import { Image } from '../../domain/models/element/Image.js';
import { QCM } from '../../domain/models/element/QCM.js';
import { QCU } from '../../domain/models/element/QCU.js';
import { QROCM } from '../../domain/models/element/QROCM.js';
import { Text } from '../../domain/models/element/Text.js';
import { Video } from '../../domain/models/element/Video.js';
import { Grain } from '../../domain/models/Grain.js';
import { Details } from '../../domain/models/module/Details.js';
import { Module } from '../../domain/models/module/Module.js';
import { QcmProposal } from '../../domain/models/QcmProposal.js';
import { QcuProposal } from '../../domain/models/QcuProposal.js';
import { TransitionText } from '../../domain/models/TransitionText.js';

export class ModuleFactory {
  static toDomain(moduleData) {
    try {
      return new Module({
        id: moduleData.id,
        slug: moduleData.slug,
        title: moduleData.title,
        transitionTexts: moduleData.transitionTexts?.map((transitionText) => new TransitionText(transitionText)) ?? [],
        details: new Details(moduleData.details),
        grains: moduleData.grains.map((grain) => {
          return new Grain({
            id: grain.id,
            title: grain.title,
            type: grain.type,
            components: grain.components
              .map((component) => {
                switch (component.type) {
                  case 'element': {
                    const element = ModuleFactory.#mapElement(component.element);
                    if (element) {
                      return new ComponentElement({ element });
                    } else {
                      return undefined;
                    }
                  }
                  case 'stepper':
                    return new ComponentStepper({
                      steps: component.steps.map((step) => {
                        return new Step({
                          elements: step.elements
                            .map((element) => {
                              const domainElement = ModuleFactory.#mapElement(element);
                              if (domainElement) {
                                return domainElement;
                              } else {
                                return undefined;
                              }
                            })
                            .filter((element) => element !== undefined),
                        });
                      }),
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

  static #mapElement(element) {
    switch (element.type) {
      case 'image':
        return ModuleFactory.#toImageDomain(element);
      case 'text':
        return ModuleFactory.#toTextDomain(element);
      case 'qcm':
        return ModuleFactory.#toQCMDomain(element);
      case 'qcu':
        return ModuleFactory.#toQCUDomain(element);
      case 'qrocm':
        return ModuleFactory.#toQROCMDomain(element);
      case 'video':
        return ModuleFactory.#toVideoDomain(element);
      default:
        logger.warn({
          event: 'module_element_type_unknown',
          message: `Element inconnu: ${element.type}`,
        });
        return undefined;
    }
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
}
