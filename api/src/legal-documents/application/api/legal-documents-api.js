import { usecases } from '../../domain/usecases/index.js';

/**
 * Accepts a legal document for a user by their ID.
 *
 * @param {Object} params - The parameters.
 * @param {string} params.userId - The ID of the user.
 * @param {string} params.service - The service associated with the legal document. (e.g. 'pix-orga')
 * @param {string} params.type - The type of the legal document. (e.g. 'TOS')
 * @returns {Promise<void>} - A promise that resolves when the legal document is accepted.
 */
const acceptLegalDocumentByUserId = async ({ userId, service, type }) => {
  return usecases.acceptLegalDocumentByUserId({ userId, service, type });
};

/**
 * Gets the status of a legal document for a user by their ID.
 *
 * @param {Object} params - The parameters.
 * @param {string} params.userId - The ID of the user.
 * @param {string} params.service - The service associated with the legal document. (e.g. 'pix-orga')
 * @param {string} params.type - The type of the legal document. (e.g. 'TOS')
 * @returns {Promise<LegalDocumentStatus>} - A promise that resolves with the status of the legal document.
 */
const getLegalDocumentStatusByUserId = async ({ userId, service, type }) => {
  return usecases.getLegalDocumentStatusByUserId({ userId, service, type });
};

export { acceptLegalDocumentByUserId, getLegalDocumentStatusByUserId };
