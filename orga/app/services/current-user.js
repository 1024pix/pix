import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CurrentUserService extends Service {
  @service session;
  @service store;
  @tracked prescriber;
  @tracked memberships;
  @tracked organization;
  @tracked isAdminInOrganization;
  @tracked isSCOManagingStudents;
  @tracked isSUPManagingStudents;
  @tracked isAgriculture;

  async load() {
    if (this.session.isAuthenticated) {
      try {
        this.prescriber = await this.store.queryRecord('prescriber', this.session.data.authenticated.user_id);
        this.memberships = await this.prescriber.memberships;
        const userOrgaSettings = await this.prescriber.userOrgaSettings;
        const membership = await this._getMembershipByUserOrgaSettings(this.memberships.toArray(), userOrgaSettings);

        await this._setOrganizationProperties(membership);
      } catch (error) {
        this.prescriber = null;
        this.memberships = null;
        return this.session.invalidate();
      }
    }
  }

  async _getMembershipByUserOrgaSettings(memberships, userOrgaSettings) {
    const organization = await userOrgaSettings.organization;
    for (let i = 0; i < memberships.length; i++) {
      const membershipOrganization = await memberships[i].organization;
      if (membershipOrganization.id === organization.id) {
        return memberships[i];
      }
    }
    return null;
  }

  async _setOrganizationProperties(membership) {
    const organization = await membership.organization;

    const isAdminInOrganization = membership.isAdmin;

    const isSCOManagingStudents = organization.isSco && organization.isManagingStudents;
    const isSUPManagingStudents = organization.isSup && organization.isManagingStudents;

    this.isAdminInOrganization = isAdminInOrganization;
    this.isSCOManagingStudents = isSCOManagingStudents;
    this.isSUPManagingStudents = isSUPManagingStudents;

    this.isAgriculture = organization.isAgriculture;

    this.organization = organization;
  }

  get shouldAccessPlacesPage() {
    return this.isAdminInOrganization && this.prescriber.placesManagement;
  }
  get shouldAccessMissionsPage() {
    return this.prescriber.missionsManagement;
  }
  get shouldAccessCampaignsPage() {
    return !this.prescriber.missionsManagement;
  }
  get shouldAccessParticipantsPage() {
    return !this.prescriber.missionsManagement;
  }
}
