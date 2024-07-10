import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { ModuleInstantiationError } from '../../domain/errors.js';
import { BlockInput } from '../../domain/models/block/BlockInput.js';
import { BlockSelect } from '../../domain/models/block/BlockSelect.js';
import { BlockSelectOption } from '../../domain/models/block/BlockSelectOption.js';
import { BlockText } from '../../domain/models/block/BlockText.js';
import { ComponentElement } from '../../domain/models/component/ComponentElement.js';
import { ComponentStepper } from '../../domain/models/component/ComponentStepper.js';
import { Step } from '../../domain/models/component/Step.js';
import { Embed } from '../../domain/models/element/Embed.js';
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
import { ElementForVerificationFactory } from './element-for-verification-factory.js';

export class ModuleFactory {
  static build(moduleData, options = { isForReferentialValidation: false }) {
    try {
      const { isForReferentialValidation } = options;

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
                    const element = ModuleFactory.#buildElement(component.element, isForReferentialValidation);
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
                              const domainElement = ModuleFactory.#buildElement(element, isForReferentialValidation);
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

  static #buildElement(element, isForReferentialValidation) {
    switch (element.type) {
      case 'embed':
        return ModuleFactory.#buildEmbed(element);
      case 'image':
        return ModuleFactory.#buildImage(element);
      case 'text':
        return ModuleFactory.#buildText(element);
      case 'video':
        return ModuleFactory.#buildVideo(element);
      case 'qcm':
        return isForReferentialValidation
          ? ElementForVerificationFactory.build(element)
          : ModuleFactory.#buildQCM(element);
      case 'qcu':
        return isForReferentialValidation
          ? ElementForVerificationFactory.build(element)
          : ModuleFactory.#buildQCU(element);
      case 'qrocm':
        return isForReferentialValidation
          ? ElementForVerificationFactory.build(element)
          : ModuleFactory.#buildQROCM(element);
      default:
        logger.warn({
          event: 'module_element_type_unknown',
          message: `Element inconnu: ${element.type}`,
        });
        return undefined;
    }
  }

  static #buildEmbed(element) {
    return new Embed({
      id: element.id,
      isCompletionRequired: element.isCompletionRequired,
      title: element.title,
      url: element.url,
      height: element.height,
    });
  }

  static #buildImage(element) {
    return new Image({
      id: element.id,
      url: element.url,
      alt: element.alt,
      alternativeText: element.alternativeText,
    });
  }

  static #buildText(element) {
    return new Text({
      id: element.id,
      content: element.content,
    });
  }

  static #buildVideo(element) {
    return new Video({
      id: element.id,
      title: element.title,
      url: element.url,
      subtitles: element.subtitles,
      transcription: element.transcription,
    });
  }

  static #buildQCM(element) {
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

  static #buildQCU(element) {
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

  static #buildQROCM(element) {
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
