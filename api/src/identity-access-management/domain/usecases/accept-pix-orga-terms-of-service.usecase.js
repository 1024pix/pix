import { legalDocumentApiRepository as injectedLegalDocumentApiRepository } from '../../infrastructure/repositories/legal-document-api.repository.js'; /**
 * @param {{
 *   userId: string,
 *   legalDocumentApiRepository: legalDocumentApiRepository
 * }} params
 * @return {Promise<void>}
 */
export const acceptPixOrgaTermsOfService = function ({
  userId,
  legalDocumentApiRepository = injectedLegalDocumentApiRepository,
} = {}) {
  return legalDocumentApiRepository.acceptPixOrgaTos({ userId });
};
