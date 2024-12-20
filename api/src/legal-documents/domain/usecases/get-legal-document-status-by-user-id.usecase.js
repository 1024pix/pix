import { config } from '../../../shared/config.js';
import { LegalDocumentVersionNotFoundError } from '../errors.js';
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
  userRepository,
  legalDocumentRepository,
  userAcceptanceRepository,
  featureToggles = config.featureToggles,
}) => {
  LegalDocumentService.assert(service);
  LegalDocumentType.assert(type);

  const { isLegalDocumentsVersioningEnabled } = featureToggles;

  if (!isLegalDocumentsVersioningEnabled) {
    const user = await userRepository.findPixOrgaCgusByUserId(userId);
    return LegalDocumentStatus.buildForLegacyPixOrgaCgu(user);
  }

  const lastLegalDocument = await legalDocumentRepository.findLastVersionByTypeAndService({ service, type });

  if (!lastLegalDocument) throw new LegalDocumentVersionNotFoundError();

  const lastUserAcceptance = await userAcceptanceRepository.findLastForLegalDocument({ userId, service, type });

  return LegalDocumentStatus.build(lastLegalDocument, lastUserAcceptance);
};

export { getLegalDocumentStatusByUserId };
