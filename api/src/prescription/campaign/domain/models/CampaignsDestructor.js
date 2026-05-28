import { PIX_ADMIN } from '../../../../shared/domain/constants.js';
import { ObjectValidationError } from '../../../../shared/domain/errors.js';

/**
 * @typedef {import ('./Campaign.js').Campaign} Campaign
 * @typedef {import ('../../../campaign-participation/domain/models/CampaignParticipation.js').CampaignParticipation} CampaignParticipation
 * @typedef {import ('../read-models/OrganizationMembership.js').OrganizationMembership} OrganizationMembership
 */

class CampaignsDestructor {
  #campaignsToDelete;
  #campaignParticipationsToDelete;
  #userId;
  #organizationId;
  #membership;
  #pixAdminRole;

  /**
   * @param {Object} params
   * @param {Array<Campaign>} params.campaignsToDelete - campaigns object to be deleted
   * @param {Array<CampaignParticipation>} params.campaignParticipationsToDelete - campaigns participations object to be deleted
   * @param {number} params.userId - userId for deletedBy
   * @param {number} params.organizationId - organizationId to check if campaigns belongs to given organizationId
   * @param {OrganizationMembership} params.membership - class with property isAdmin to check if user is admin in organization or not
   */
  constructor({ campaignsToDelete, campaignParticipationsToDelete, userId, organizationId, membership, pixAdminRole }) {
    this.#campaignsToDelete = campaignsToDelete;
    this.#campaignParticipationsToDelete = campaignParticipationsToDelete;
    this.#userId = userId;
    this.#organizationId = organizationId;
    this.#membership = membership;
    this.#pixAdminRole = pixAdminRole;
    this.#validate();
  }

  #validate() {
    const isUserOwnerOfAllCampaigns = this.#campaignsToDelete.every((campaign) => campaign.ownerId === this.#userId);
    const isAllCampaignsBelongsToOrganization = this.#campaignsToDelete.every(
      (campaign) => campaign.organizationId === this.#organizationId,
    );
    const isAllowedPixAdminRole = [
      PIX_ADMIN.ROLES.SUPER_ADMIN,
      PIX_ADMIN.ROLES.SUPPORT,
      PIX_ADMIN.ROLES.METIER,
    ].includes(this.#pixAdminRole);

    if (!isAllCampaignsBelongsToOrganization)
      throw new ObjectValidationError('Some campaigns does not belong to organization.');
    if (!this.#membership?.isAdmin && !isUserOwnerOfAllCampaigns && !isAllowedPixAdminRole)
      throw new ObjectValidationError('User does not have right to delete some campaigns.');
  }

  delete({ keepPreviousDeletion = false } = {}) {
    this.#campaignParticipationsToDelete.forEach((campaignParticipation) => campaignParticipation.delete(this.#userId));
    this.#campaignsToDelete.forEach((campaign) => campaign.delete(this.#userId, { keepPreviousDeletion }));
  }

  get campaignParticipations() {
    return this.#campaignParticipationsToDelete;
  }

  get campaigns() {
    return this.#campaignsToDelete;
  }
}

export { CampaignsDestructor };
