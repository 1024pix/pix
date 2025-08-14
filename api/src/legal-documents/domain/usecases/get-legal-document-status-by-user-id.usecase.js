import { logger as injectedLogger } from '../../../shared/infrastructure/utils/logger.js';
import * as injectedLegalDocumentRepository from '../../infrastructure/repositories/legal-document.repository.js';
import * as injectedUserAcceptanceRepository from '../../infrastructure/repositories/user-acceptance.repository.js';
import { LegalDocumentService } from '../models/LegalDocumentService.js';
import { LegalDocumentStatus } from '../models/LegalDocumentStatus.js';
import { LegalDocumentType } from '../models/LegalDocumentType.js';

/**
 * Gets the legal document status by user ID.
 *
 * @param {Object} params - The parameters.
 * @param {string} params.userId - The user ID.
 * @param {string} params.service - The service associated with the legal document.
 * @param {string} params.type - The type of the legal document.
 * @returns {Promise<LegalDocumentStatus>} The legal document status.
 * @throws {Error} If no legal document version is found for the type and service.
 */
const getLegalDocumentStatusByUserId = async ({
  userId,
  service,
  type,
  legalDocumentRepository = injectedLegalDocumentRepository,
  userAcceptanceRepository = injectedUserAcceptanceRepository,
  logger = injectedLogger,
} = {}) => {
  LegalDocumentService.assert(service);
  LegalDocumentType.assert(type);

  const lastLegalDocument = await legalDocumentRepository.findLastVersionByTypeAndService({ service, type });

  if (!lastLegalDocument) {
    logger.warn(`Unknown legal document version found for ${service} and ${type}`);
    return LegalDocumentStatus.notFound();
  }

  const lastUserAcceptance = await userAcceptanceRepository.findLastForLegalDocument({ userId, service, type });

  return LegalDocumentStatus.build(lastLegalDocument, lastUserAcceptance);
};

export { getLegalDocumentStatusByUserId };
