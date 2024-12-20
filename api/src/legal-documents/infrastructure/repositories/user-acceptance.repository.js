import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

const TABLE_NAME = 'legal-document-version-user-acceptances';

/**
 * Creates a new user acceptance record for a legal document version.
 *
 * @param {Object} params - The parameters for creating the user acceptance.
 * @param {string} params.userId - The ID of the user.
 * @param {string} params.legalDocumentVersionId - The ID of the legal document version.
 * @returns {Promise<void>} A promise that resolves when the record is created.
 */
const create = async ({ userId, legalDocumentVersionId }) => {
  const knexConnection = DomainTransaction.getConnection();
  await knexConnection(TABLE_NAME).insert({ userId, legalDocumentVersionId });
};

/**
 * Finds the last user acceptance record for a specific legal document type and service.
 *
 * @param {Object} params - The parameters for finding the user acceptance.
 * @param {string} params.userId - The ID of the user.
 * @param {string} params.service - The service associated with the legal document.
 * @param {string} params.type - The type of the legal document.
 * @returns {Promise<Object|null>} A promise that resolves to the user acceptance record or null if not found.
 */
const findLastForLegalDocument = async ({ userId, service, type }) => {
  const knexConnection = DomainTransaction.getConnection();
  const userAcceptanceDto = await knexConnection(TABLE_NAME)
    .select('userId', 'legalDocumentVersionId', 'acceptedAt')
    .join(
      'legal-document-versions',
      'legal-document-version-user-acceptances.legalDocumentVersionId',
      'legal-document-versions.id',
    )
    .where({ userId, service, type })
    .orderBy('versionAt', 'desc')
    .first();

  if (!userAcceptanceDto) return null;

  return userAcceptanceDto;
};

export { create, findLastForLegalDocument };
