import { UnableToAttachCertificationCenterToOrganization } from '../errors.js';

class Structure {
  /**
   * @param {Object} params
   * @param {number} params.id
   * @param {number | null} params.organizationId
   * @param {number | null} params.certificationCenterId
   */
  constructor({ id, organizationId = null, certificationCenterId = null }) {
    this.id = id;
    this.organizationId = organizationId;
    this.certificationCenterId = certificationCenterId;
  }

  /**
   * Attaches certification center to this structure.
   *
   * @param {object} params
   * @param {number} params.certificationCenterId
   * @param {Structure|null} [params.certificationCenterStructure] - TODO(PIX-24402): retirer null quand tous les cdc auront une structure
   */
  attachCertificationCenter({ certificationCenterId, certificationCenterStructure = null }) {
    // TODO(PIX-24402): retirer le param certificationCenterId lorsque certificationCenterStructure ne pourra plus être null
    const organizationId = this.organizationId;

    if (this.certificationCenterId) {
      throw new UnableToAttachCertificationCenterToOrganization({
        code: 'ALREADY_ATTACHED_ORGANIZATION',
        message: 'Organization already has an attached certification center',
        meta: {
          organizationId,
          alreadyAttachedCertificationCenterId: this.certificationCenterId,
        },
      });
    }

    if (certificationCenterStructure?.organizationId) {
      throw new UnableToAttachCertificationCenterToOrganization({
        code: 'ALREADY_ATTACHED_CERTIFICATION_CENTER',
        message: 'Unable to attach a certification center already attached to another organization.',
        meta: {
          organizationId,
          certificationCenterId,
          alreadyAttachedOrganizationId: certificationCenterStructure.organizationId,
        },
      });
    }

    this.certificationCenterId = certificationCenterId;
  }
}

export { Structure };
