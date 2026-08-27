import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { LegalDocumentService } from '../models/LegalDocumentService.js';
import { LegalDocumentType } from '../models/LegalDocumentType.js';

const { TOS } = LegalDocumentType.VALUES;
const { PIX_APP, PIX_CERTIF } = LegalDocumentService.VALUES;

/**
 * Accepts a legal document by user ID.
 *
 * @param {Object} params - The parameters.
 * @param {string} params.userId - The ID of the user.
 * @param {string} params.service - The service of the legal document.
 * @param {string} params.type - The type of the legal document.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
export const acceptLegalDocumentByUserId = withTransaction(
  async ({ userId, service, type, legalDocumentRepository, userAcceptanceRepository, userRepository, logger }) => {
    LegalDocumentType.assert(type);
    LegalDocumentService.assert(service);

    // legacy document acceptance
    if (type === TOS && service === PIX_APP) {
      await userRepository.acceptLegacyPixAppTermsOfService(userId);
    }

    // legacy document acceptance
    if (type === TOS && service === PIX_CERTIF) {
      await userRepository.acceptLegacyPixCertifTermsOfService(userId);
    }

    const legalDocument = await legalDocumentRepository.findLastVersionByTypeAndService({ service, type });
    if (!legalDocument) {
      logger.warn(`No legal document found for service: ${service} and type: ${type}`);
      return;
    }

    const doesUserAcceptanceAlreadyExist = await userAcceptanceRepository.findByLegalDocumentVersionId({
      userId,
      legalDocumentVersionId: legalDocument.id,
    });

    if (doesUserAcceptanceAlreadyExist) {
      return;
    }

    await userAcceptanceRepository.create({ userId, legalDocumentVersionId: legalDocument.id });
  },
);
