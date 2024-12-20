import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { LegalDocument } from '../../domain/models/LegalDocument.js';

const TABLE_NAME = 'legal-document-versions';

/**
 * Retrieves the latest version of a legal document by type and service.
 *
 * @param {Object} params - The parameters.
 * @param {string} params.service - The service associated with the legal document.
 * @param {string} params.type - The type of the legal document.
 * @returns {Promise<LegalDocument|null>} The latest version of the legal document or null if not found.
 */
const findLastVersionByTypeAndService = async ({ service, type }) => {
  const knexConnection = DomainTransaction.getConnection();
  const documentVersionDto = await knexConnection(TABLE_NAME)
    .where({ service, type })
    .orderBy('versionAt', 'desc')
    .first();

  if (!documentVersionDto) return null;

  return new LegalDocument(documentVersionDto);
};

/**
 * Creates a new legal document in the database.
 *
 * @param {Object} params - The parameters.
 * @param {string} params.service - The service associated with the legal document.
 * @param {string} params.type - The type of the legal document.
 * @param {Date} params.versionAt - The date of the legal document version.
 * @returns {Promise<LegalDocument>} The newly created legal document.
 */
const create = async ({ service, type, versionAt }) => {
  const knexConnection = DomainTransaction.getConnection();

  const [documentVersionDto] = await knexConnection(TABLE_NAME).insert({ service, type, versionAt }).returning('*');

  return new LegalDocument(documentVersionDto);
};

export { create, findLastVersionByTypeAndService };
