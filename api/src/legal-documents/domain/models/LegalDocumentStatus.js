export const STATUS = {
  ACCEPTED: 'accepted',
  REQUESTED: 'requested',
  UPDATE_REQUESTED: 'update-requested',
};

export class LegalDocumentStatus {
  constructor({ status, acceptedAt, documentPath }) {
    this.status = status;
    this.acceptedAt = acceptedAt;
    this.documentPath = documentPath;
  }

  /**
   * Builds a LegalDocumentStatus based on legacy PixOrga CGU.
   *
   * @param {Object} userPixOrgaCgu - The user object.
   * @param {boolean} userPixOrgaCgu.pixOrgaTermsOfServiceAccepted - Indicates if the PixOrga terms of service are accepted.
   * @param {Date} userPixOrgaCgu.lastPixOrgaTermsOfServiceValidatedAt - The date when the PixOrga terms of service were last validated.
   * @returns {LegalDocumentStatus} The legal document status.
   */
  static buildForLegacyPixOrgaCgu(userPixOrgaCgu) {
    const LEGACY_PIXORGA_TOS_PATH = 'pix-orga-tos-2024-01-02';
    const { pixOrgaTermsOfServiceAccepted, lastPixOrgaTermsOfServiceValidatedAt } = userPixOrgaCgu;

    return new LegalDocumentStatus({
      status: pixOrgaTermsOfServiceAccepted ? STATUS.ACCEPTED : STATUS.REQUESTED,
      acceptedAt: lastPixOrgaTermsOfServiceValidatedAt,
      documentPath: LEGACY_PIXORGA_TOS_PATH,
    });
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
}
