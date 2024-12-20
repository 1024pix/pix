import { LegalDocumentService } from '../models/LegalDocumentService.js';
import { LegalDocumentType } from '../models/LegalDocumentType.js';

const { PIX_ORGA } = LegalDocumentService.VALUES;
const { TOS } = LegalDocumentType.VALUES;

/**
 * Accepts a legal document by user ID.
 *
 * @param {Object} params - The parameters.
 * @param {string} params.userId - The ID of the user.
 * @param {string} params.service - The service of the legal document.
 * @param {string} params.type - The type of the legal document.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
const acceptLegalDocumentByUserId = async ({
  userId,
  service,
  type,
  userRepository,
  legalDocumentRepository,
  userAcceptanceRepository,
  logger,
}) => {
  LegalDocumentType.assert(type);
  LegalDocumentService.assert(service);

  // legacy document acceptance
  if (type === TOS && service === PIX_ORGA) {
    await userRepository.setPixOrgaCguByUserId(userId);
  }

  // new document acceptance
  const legalDocument = await legalDocumentRepository.findLastVersionByTypeAndService({ service, type });
  if (!legalDocument) {
    logger.warn(`No legal document found for service: ${service} and type: ${type}`);
    return;
  }

  await userAcceptanceRepository.create({ userId, legalDocumentVersionId: legalDocument.id });
};

export { acceptLegalDocumentByUserId };
