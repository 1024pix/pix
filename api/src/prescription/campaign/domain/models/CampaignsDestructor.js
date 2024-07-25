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

  /**
   * @param {Object} params
   * @param {Array<Campaign>} params.campaignsToDelete - campaigns object to be deleted
   * @param {Array<CampaignParticipation>} params.campaignParticipationsToDelete - campaigns participations object to be deleted
   * @param {number} params.userId - userId for deletedBy
   * @param {number} params.organizationId - organizationId to check if campaigns belongs to given organizationId
   * @param {OrganizationMembership} params.membership - class with property isAdmin to check is user is admin in organization or not
   */
  constructor({ campaignsToDelete, campaignParticipationsToDelete, userId, organizationId, membership }) {
    this.#campaignsToDelete = campaignsToDelete;
    this.#campaignParticipationsToDelete = campaignParticipationsToDelete;
    this.#userId = userId;
    this.#organizationId = organizationId;
    this.#membership = membership;
    this.#validate();
  }

  #validate() {
    const isUserOwnerOfAllCampaigns = this.#campaignsToDelete.every((campaign) => campaign.ownerId === this.#userId);
    const isAllCampaignsBelongsToOrganization = this.#campaignsToDelete.every(
      (campaign) => campaign.organizationId === this.#organizationId,
    );

    if (!isAllCampaignsBelongsToOrganization)
      throw new ObjectValidationError('Some campaigns does not belong to organization.');
    if (!this.#membership.isAdmin && !isUserOwnerOfAllCampaigns)
      throw new ObjectValidationError('User does not have right to delete some campaigns.');
  }

  delete() {
    this.#campaignParticipationsToDelete.forEach((campaignParticipation) => campaignParticipation.delete(this.#userId));
    this.#campaignsToDelete.forEach((campaign) => campaign.delete(this.#userId));
  }

  get campaignParticipations() {
    return this.#campaignParticipationsToDelete;
  }

  get campaigns() {
    return this.#campaignsToDelete;
  }
}

export { CampaignsDestructor };
