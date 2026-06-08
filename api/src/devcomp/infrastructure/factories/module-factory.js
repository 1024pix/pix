import { getAssetInfos } from '../../../shared/infrastructure/repositories/pix-assets-repository.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { ModuleInstantiationError } from '../../domain/errors.js';
import { BlockInput } from '../../domain/models/block/BlockInput.js';
import { BlockSelect } from '../../domain/models/block/BlockSelect.js';
import { BlockSelectOption } from '../../domain/models/block/BlockSelectOption.js';
import { BlockText } from '../../domain/models/block/BlockText.js';
import { ComponentElement } from '../../domain/models/component/ComponentElement.js';
import { ComponentStepper } from '../../domain/models/component/ComponentStepper.js';
import { Step } from '../../domain/models/component/Step.js';
import { Audio } from '../../domain/models/element/Audio.js';
import { CustomDraft } from '../../domain/models/element/CustomDraft.js';
import { CustomElement } from '../../domain/models/element/CustomElement.js';
import { Download } from '../../domain/models/element/Download.js';
import { Embed } from '../../domain/models/element/Embed.js';
import { Expand } from '../../domain/models/element/Expand.js';
import { Card } from '../../domain/models/element/flashcards/Card.js';
import { Flashcards } from '../../domain/models/element/flashcards/Flashcards.js';
import { Image } from '../../domain/models/element/Image.js';
import { QAB } from '../../domain/models/element/qab/QAB.js';
import { QABCard } from '../../domain/models/element/qab/QABCard.js';
import { QCM } from '../../domain/models/element/QCM.js';
import { QCMDeclarative } from '../../domain/models/element/QCM-declarative.js';
import { QCU } from '../../domain/models/element/QCU.js';
import { QCUDeclarative } from '../../domain/models/element/QCU-declarative.js';
import { QCUDiscovery } from '../../domain/models/element/QCU-discovery.js';
import { QROCM } from '../../domain/models/element/QROCM.js';
import { Separator } from '../../domain/models/element/Separator.js';
import { ShortVideo } from '../../domain/models/element/ShortVideo.js';
import { Text } from '../../domain/models/element/Text.js';
import { Video } from '../../domain/models/element/Video.js';
import { Grain } from '../../domain/models/Grain.js';
import { Details } from '../../domain/models/module/Details.js';
import { GlossaryEntry } from '../../domain/models/module/GlossaryEntry.js';
import { Module } from '../../domain/models/module/Module.js';
import { Section } from '../../domain/models/module/Section.js';
import { QcmProposal } from '../../domain/models/QcmProposal.js';
import { QcuProposal } from '../../domain/models/QcuProposal.js';

export class ModuleFactory {
  static async build(moduleData) {
    try {
      return new Module({
        id: moduleData.id,
        shortId: moduleData.shortId,
        slug: moduleData.slug,
        title: moduleData.title,
        version: moduleData.version,
        isBeta: moduleData.isBeta,
        visibility: moduleData.visibility,
        details: new Details(moduleData.details),
        glossary: moduleData.glossary.map(({ word, definition }) => new GlossaryEntry({ word, definition })),
        sections: await Promise.all(
          await Promise.all(
            moduleData.sections.map(async (section) => {
              return new Section({
                id: section.id,
                type: section.type,
                grains: await Promise.all(
                  await Promise.all(
                    section.grains.map(async (grain) => {
                      return new Grain({
                        id: grain.id,
                        title: grain.title,
                        type: grain.type,
                        components: (
                          await Promise.all(
                            grain.components.map(async (component) => {
                              switch (component.type) {
                                case 'element': {
                                  const element = await ModuleFactory.#buildElement(component.element);
                                  if (element) {
                                    return new ComponentElement({ element });
                                  } else {
                                    return undefined;
                                  }
                                }
                                case 'stepper':
                                  return new ComponentStepper({
                                    steps: await Promise.all(
                                      component.steps.map(async (step) => {
                                        return new Step({
                                          elements: (
                                            await Promise.all(
                                              step.elements.map(async (element) => {
                                                const domainElement = await ModuleFactory.#buildElement(element);
                                                if (domainElement) {
                                                  return domainElement;
                                                } else {
                                                  return undefined;
                                                }
                                              }),
                                            )
                                          ).filter((element) => element !== undefined),
                                        });
                                      }),
                                    ),
                                    instruction: component.instruction,
                                  });
                                default:
                                  logger.warn({
                                    event: 'module_component_type_unknown',
                                    message: `Component inconnu: ${component.type}`,
                                  });
                                  return undefined;
                              }
                            }),
                          )
                        ).filter((component) => component !== undefined),
                      });
                    }),
                  ),
                ),
              });
            }),
          ),
        ),
      });
    } catch (e) {
      throw new ModuleInstantiationError(e.message);
    }
  }

  static async #buildElement(element) {
    switch (element.type) {
      case 'audio':
        return ModuleFactory.#buildAudio(element);
      case 'custom':
        return ModuleFactory.#buildCustom(element);
      case 'custom-draft':
        return ModuleFactory.#buildCustomDraft(element);
      case 'download':
        return ModuleFactory.#buildDownload(element);
      case 'embed':
        return ModuleFactory.#buildEmbed(element);
      case 'expand':
        return ModuleFactory.#buildExpand(element);
      case 'image':
        return await ModuleFactory.#buildImage(element);
      case 'separator':
        return ModuleFactory.#buildSeparator(element);
      case 'text':
        return ModuleFactory.#buildText(element);
      case 'video':
        return ModuleFactory.#buildVideo(element);
      case 'short-video':
        return ModuleFactory.#buildShortVideo(element);
      case 'qab':
        return ModuleFactory.#buildQAB(element);
      case 'qcm':
        return ModuleFactory.#buildQCM(element);
      case 'qcu':
        return ModuleFactory.#buildQCU(element);
      case 'qcu-declarative':
        return ModuleFactory.#buildQCUDeclarative(element);
      case 'qcu-discovery':
        return ModuleFactory.#buildQCUDiscovery(element);
      case 'qrocm':
        return ModuleFactory.#buildQROCM(element);
      case 'flashcards':
        return ModuleFactory.#buildFlashcards(element);
      default:
        logger.warn({
          event: 'module_element_type_unknown',
          message: `Element inconnu: ${element.type}`,
        });
        return undefined;
    }
  }
  static #buildAudio(element) {
    return new Audio({
      id: element.id,
      title: element.title,
      url: element.url,
      transcription: element.transcription,
    });
  }

  static #buildCustom(element) {
    return new CustomElement({
      id: element.id,
      title: element.title,
      instruction: element.instruction,
      functionalInstruction: element.functionalInstruction,
      tagName: element.tagName,
      props: element.props,
    });
  }

  static #buildCustomDraft(element) {
    return new CustomDraft({
      id: element.id,
      title: element.title,
      url: element.url,
      instruction: element.instruction,
      height: element.height,
    });
  }

  static #buildDownload(element) {
    return new Download({
      id: element.id,
      files: element.files,
    });
  }

  static #buildEmbed(element) {
    return new Embed({
      id: element.id,
      isCompletionRequired: element.isCompletionRequired,
      title: element.title,
      url: element.url,
      instruction: element.instruction,
      height: element.height,
    });
  }

  static #buildExpand(element) {
    return new Expand({
      id: element.id,
      title: element.title,
      content: element.content,
    });
  }

  static async #buildImage(element) {
    return new Image({
      id: element.id,
      url: element.url,
      alt: element.alt,
      alternativeText: element.alternativeText,
      legend: element.legend,
      licence: element.licence,
      infos: await ModuleFactory.getAssetMetadata(element.url),
    });
  }

  static #buildSeparator(element) {
    return new Separator({
      id: element.id,
    });
  }

  static #buildText(element) {
    return new Text({
      id: element.id,
      content: element.content,
      tag: element.tag,
    });
  }

  static #buildVideo(element) {
    return new Video({
      id: element.id,
      title: element.title,
      url: element.url,
      subtitles: element.subtitles,
      transcription: element.transcription,
      poster: element.poster,
    });
  }

  static #buildShortVideo(element) {
    return new ShortVideo({
      id: element.id,
      title: element.title,
      url: element.url,
      transcription: element.transcription,
    });
  }

  static async #buildQAB(element) {
    return new QAB({
      id: element.id,
      type: element.type,
      instruction: element.instruction,
      cards: await Promise.all(
        element.cards.map(async (card) => {
          return new QABCard({
            ...card,
            image: {
              altText: card.image?.altText,
              url: card.image?.url,
              information: card.image?.url ? await ModuleFactory.getAssetMetadata(card.image.url) : {},
            },
          });
        }),
      ),
      feedback: element.feedback,
    });
  }

  static #buildQCM(element) {
    return new QCM({
      hasShortProposals: element.hasShortProposals,
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

  static #buildQCMDeclarative(element) {
    return new QCMDeclarative({
      hasShortProposals: element.hasShortProposals,
      id: element.id,
      instruction: element.instruction,
      proposals: element.proposals.map((proposal) => {
        return new QcmProposal({
          id: proposal.id,
          content: proposal.content,
        });
      }),
      feedback: element.feedback,
    });
  }

  static #buildQCU(element) {
    return new QCU({
      hasShortProposals: element.hasShortProposals,
      id: element.id,
      instruction: element.instruction,
      locales: element.locales,
      proposals: element.proposals.map((proposal) => {
        return new QcuProposal({
          id: proposal.id,
          content: proposal.content,
          feedback: proposal.feedback,
        });
      }),
      solution: element.solution,
    });
  }

  static #buildQCUDeclarative(element) {
    return new QCUDeclarative({
      hasShortProposals: element.hasShortProposals,
      id: element.id,
      instruction: element.instruction,
      proposals: element.proposals.map((proposal) => {
        return new QcuProposal({
          id: proposal.id,
          content: proposal.content,
          feedback: proposal.feedback,
        });
      }),
    });
  }

  static #buildQCUDiscovery(element) {
    return new QCUDiscovery({
      hasShortProposals: element.hasShortProposals,
      id: element.id,
      instruction: element.instruction,
      proposals: element.proposals.map((proposal) => {
        return new QcuProposal({
          id: proposal.id,
          content: proposal.content,
          feedback: proposal.feedback,
        });
      }),
      solution: element.solution,
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
      feedbacks: element.feedbacks,
    });
  }

  static async #buildFlashcards(element) {
    return new Flashcards({
      id: element.id,
      title: element.title,
      instruction: element.instruction,
      introImage: {
        url: element.introImage.url,
        information: element.introImage?.url ? await ModuleFactory.getAssetMetadata(element.introImage.url) : {},
      },
      cards: await Promise.all(
        element.cards.map(async (card) => {
          return new Card({
            id: card.id,
            recto: {
              text: card.recto.text,
              image: {
                url: card.recto.image?.url,
                information: card.recto.image?.url ? await ModuleFactory.getAssetMetadata(card.recto.image.url) : {},
              },
            },
            verso: {
              text: card.verso.text,
              image: {
                url: card.verso.image?.url,
                information: card.verso.image?.url ? await ModuleFactory.getAssetMetadata(card.verso.image.url) : {},
              },
            },
          });
        }),
      ),
    });
  }

  static async getAssetMetadata(url) {
    try {
      return await getAssetInfos(url);
    } catch (error) {
      logger.debug(`Error when getting assets metadata with url ${url}: ${error}`);
      return {};
    }
  }
}
