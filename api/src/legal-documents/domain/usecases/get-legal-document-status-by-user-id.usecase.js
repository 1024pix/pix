import { featureToggles } from '../../../shared/infrastructure/feature-toggles/index.js';
import { LegalDocumentService } from '../models/LegalDocumentService.js';
import { LegalDocumentStatus, STATUS } from '../models/LegalDocumentStatus.js';
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

const { PIX_APP, PIX_CERTIF } = LegalDocumentService.VALUES;
const { TOS } = LegalDocumentType.VALUES;

const isNewPixAppLegalDocumentsVersioning = featureToggles.use('newPixAppLegalDocumentsVersioning');
const isNewPixCertifLegalDocumentsVersioningEnabled = featureToggles.use('newPixCertifLegalDocumentsVersioning');

export async function getLegalDocumentStatusByUserId({
  userId,
  service,
  type,
  legalDocumentRepository,
  userRepository,
  userScoRepository,
  userAcceptanceRepository,
  logger,
}) {
  LegalDocumentService.assert(service);
  LegalDocumentType.assert(type);

  const isPixAppTos = service === PIX_APP && type === TOS;
  if (isPixAppTos && !isNewPixAppLegalDocumentsVersioning.value) {
    const user = await userRepository.getPixAppLegacyCguByUserId(userId);
    return LegalDocumentStatus.buildForLegacyPixAppCgu(user);
  }

  const isPixCertifTos = service === PIX_CERTIF && type === TOS;
  if (isPixCertifTos && !isNewPixCertifLegalDocumentsVersioningEnabled.value) {
    const user = await userRepository.getPixCertifLegacyTosByUserId(userId);
    return LegalDocumentStatus.buildForLegacyPixCertifTos(user);
  }

  const lastLegalDocument = await legalDocumentRepository.findLastVersionByTypeAndService({ service, type });
  if (!lastLegalDocument) {
    logger.warn(`Unknown legal document version found for ${service} and ${type}`);
    return LegalDocumentStatus.notFound();
  }

  const lastUserAcceptance = await userAcceptanceRepository.findLastForLegalDocument({ userId, service, type });
  const legalDocumentStatus = LegalDocumentStatus.build(lastLegalDocument, lastUserAcceptance);

  if (
    isPixAppTos &&
    (legalDocumentStatus.status === STATUS.REQUESTED || legalDocumentStatus.status === STATUS.UPDATE_REQUESTED)
  ) {
    const isAnonymous = await userRepository.isAnonymous(userId);
    if (isAnonymous) {
      return LegalDocumentStatus.notApplicable();
    }

    const isScoStudent = await userScoRepository.isUserScoStudent(userId);
    if (isScoStudent) {
      return LegalDocumentStatus.notApplicable();
    }
  }

  return legalDocumentStatus;
}
