export const STATUS = {
  ACCEPTED: 'accepted',
  REQUESTED: 'requested',
  NOT_APPLICABLE: 'not-applicable',
  UPDATE_REQUESTED: 'update-requested',
};

export class LegalDocumentStatus {
  constructor({ status, acceptedAt, documentPath }) {
    this.status = status;
    this.acceptedAt = acceptedAt;
    this.documentPath = documentPath;
  }

  /**
   * Builds a LegalDocumentStatus based on the last document version and user acceptance.
   *
   * @param {Object} lastDocumentVersion - The last document version object.
   * @param {string} lastDocumentVersion.id - The ID of the last document version.
   * @param {Object} lastUserAcceptance - The last user acceptance object.
   * @param {string} lastUserAcceptance.legalDocumentVersionId - The ID of the accepted legal document version.
   * @param {Date} lastUserAcceptance.acceptedAt - The date when the document was accepted.
   * @returns {LegalDocumentStatus} The legal document status.
   */
  static build(lastDocumentVersion, lastUserAcceptance) {
    const documentPath = lastDocumentVersion.buildDocumentPath();

    if (!lastUserAcceptance) {
      return new LegalDocumentStatus({ status: STATUS.REQUESTED, acceptedAt: null, documentPath });
    }

    const { legalDocumentVersionId, acceptedAt } = lastUserAcceptance;
    if (lastDocumentVersion.id === legalDocumentVersionId) {
      return new LegalDocumentStatus({ status: STATUS.ACCEPTED, acceptedAt, documentPath });
    }

    return new LegalDocumentStatus({ status: STATUS.UPDATE_REQUESTED, acceptedAt: null, documentPath });
  }

  static buildForLegacyPixAppCgu({ mustValidateTermsOfService, lastTermsOfServiceValidatedAt }) {
    if (mustValidateTermsOfService) {
      return new LegalDocumentStatus({ status: STATUS.UPDATE_REQUESTED, acceptedAt: null, documentPath: null });
    }
    return new LegalDocumentStatus({
      status: STATUS.ACCEPTED,
      acceptedAt: lastTermsOfServiceValidatedAt,
      documentPath: null,
    });
  }

  static notFound() {
    return new LegalDocumentStatus({ status: STATUS.REQUESTED, acceptedAt: null, documentPath: null });
  }
}
