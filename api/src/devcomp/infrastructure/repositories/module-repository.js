import { BlockInput } from '../../domain/models/block/BlockInput.js';
import { BlockSelect } from '../../domain/models/block/BlockSelect.js';
import { BlockSelectOption } from '../../domain/models/block/BlockSelectOption.js';
import { BlockText } from '../../domain/models/block/BlockText.js';
import { Details } from '../../domain/models/module/Details.js';
import { Grain } from '../../domain/models/Grain.js';
import { Image } from '../../domain/models/element/Image.js';
import { LearningContentResourceNotFound } from '../../../shared/infrastructure/datasources/learning-content/LearningContentResourceNotFound.js';
import { Module } from '../../domain/models/module/Module.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { QCM } from '../../domain/models/element/QCM.js';
import { QCMForAnswerVerification } from '../../domain/models/element/QCM-for-answer-verification.js';
import { QCU } from '../../domain/models/element/QCU.js';
import { QCUForAnswerVerification } from '../../domain/models/element/QCU-for-answer-verification.js';
import { QROCM } from '../../domain/models/element/QROCM.js';
import { QROCMForAnswerVerification } from '../../domain/models/element/QROCM-for-answer-verification.js';
import { QcmProposal } from '../../domain/models/QcmProposal.js';
import { QcuProposal } from '../../domain/models/QcuProposal.js';
import { Text } from '../../domain/models/element/Text.js';
import { TransitionText } from '../../domain/models/TransitionText.js';
import { Video } from '../../domain/models/element/Video.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';

async function getBySlug({ slug, moduleDatasource }) {
  try {
    const moduleData = await moduleDatasource.getBySlug(slug);

    return _toDomain(moduleData);
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

    return _toDomainForVerification(moduleData);
  } catch (e) {
    if (e instanceof LearningContentResourceNotFound) {
      throw new NotFoundError();
    }
    throw e;
  }
}

function _toDomain(moduleData) {
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
        elements: grain.elements
          .map((element) => {
            switch (element.type) {
              case 'image':
                return _toImageDomain(element);
              case 'text':
                return _toTextDomain(element);
              case 'qcm':
                return _toQCMDomain(element);
              case 'qcu':
                return _toQCUDomain(element);
              case 'qrocm':
                return _toQROCMDomain(element);
              case 'video':
                return _toVideoDomain(element);
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
}

function _toDomainForVerification(moduleData) {
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
        elements: grain.elements
          .map((element) => {
            switch (element.type) {
              case 'image':
                return _toImageDomain(element);
              case 'text':
                return _toTextDomain(element);
              case 'qcu':
                return _toQCUForAnswerVerificationDomain(element);
              case 'qcm':
                return _toQCMForAnswerVerificationDomain(element);
              case 'qrocm':
                return _toQROCMForAnswerVerificationDomain(element);
              case 'video':
                return _toVideoDomain(element);
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
}

function _toTextDomain(element) {
  return new Text({
    id: element.id,
    content: element.content,
  });
}

function _toImageDomain(element) {
  return new Image({
    id: element.id,
    url: element.url,
    alt: element.alt,
    alternativeText: element.alternativeText,
  });
}

function _toVideoDomain(element) {
  return new Video({
    id: element.id,
    title: element.title,
    url: element.url,
    subtitles: element.subtitles,
    transcription: element.transcription,
  });
}

function _toQCUForAnswerVerificationDomain(element) {
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

function _toQCUDomain(element) {
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

function _toQCMDomain(element) {
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

function _toQCMForAnswerVerificationDomain(element) {
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

function _toQROCMForAnswerVerificationDomain(element) {
  return new QROCMForAnswerVerification({
    id: element.id,
    instruction: element.instruction,
    locales: element.locales,
    proposals: element.proposals,
    feedbacks: element.feedbacks,
  });
}

function _toQROCMDomain(element) {
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

export { getBySlug, getBySlugForVerification };
