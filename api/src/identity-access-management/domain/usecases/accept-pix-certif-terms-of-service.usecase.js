/**
 * @param {{
 *   userId: string,
 *   legalDocumentApiRepository: Object
 * }} params
 * @return {Promise<void>}
 */
export const acceptPixCertifTermsOfService = async function ({ userId, legalDocumentApiRepository }) {
  await legalDocumentApiRepository.acceptPixCertifTos({ userId });
};
