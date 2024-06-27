import { ObjectValidationError } from '../../../../../lib/domain/errors.js';

class CampaignsDestructor {
  #campaignsToDelete;
  #campaignParticipationsToDelete;
  #userId;
  #organizationId;
  #membership;

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
