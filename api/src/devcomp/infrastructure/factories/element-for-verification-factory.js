import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { ElementInstantiationError } from '../../domain/errors.js';
import { QCMForAnswerVerification } from '../../domain/models/element/QCM-for-answer-verification.js';
import { QCUForAnswerVerification } from '../../domain/models/element/QCU-for-answer-verification.js';
import { QROCMForAnswerVerification } from '../../domain/models/element/QROCM-for-answer-verification.js';
import { QcmProposal } from '../../domain/models/QcmProposal.js';
import { QcuProposal } from '../../domain/models/QcuProposal.js';

export class ElementForVerificationFactory {
  static toDomain(elementData) {
    try {
      switch (elementData.type) {
        case 'qcm':
          return ElementForVerificationFactory.#toQCMForAnswerVerificationDomain(elementData);
        case 'qcu':
          return ElementForVerificationFactory.#toQCUForAnswerVerificationDomain(elementData);
        case 'qrocm':
          return ElementForVerificationFactory.#toQROCMForAnswerVerificationDomain(elementData);
        default:
          logger.warn({
            event: 'module_element_type_not_handled_for_verification',
            message: `Element type not handled for verification: ${elementData.type}`,
          });
          return undefined;
      }
    } catch (e) {
      throw new ElementInstantiationError(e.message);
    }
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
