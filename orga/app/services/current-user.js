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
  @tracked isGARAuthenticationMethod;

  async load() {
    if (this.session.isAuthenticated) {
      try {
        this.prescriber = await this.store.findRecord('prescriber', this.session.data.authenticated.user_id, {
          reload: true,
        });
        this.memberships = await this.prescriber.memberships;
        const userOrgaSettings = await this.prescriber.userOrgaSettings;
        const membership = await this._getMembershipByUserOrgaSettings(this.memberships.slice(), userOrgaSettings);

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
    this.isGARAuthenticationMethod = organization.identityProviderForCampaigns === 'GAR';
    this.isAgriculture = organization.isAgriculture;
    this.organization = organization;
  }

  get homePage() {
    if (this.canAccessMissionsPage) {
      return 'authenticated.missions';
    }
    return 'authenticated.campaigns';
  }

  get canAccessImportPage() {
    return Boolean(
      (this.isSCOManagingStudents || this.isSUPManagingStudents || this.hasLearnerImportFeature) &&
        this.isAdminInOrganization,
    );
  }

  get canAccessPlacesPage() {
    return this.isAdminInOrganization && this.prescriber.placesManagement;
  }

  get canAccessMissionsPage() {
    return this.prescriber.missionsManagement;
  }

  get canAccessCampaignsPage() {
    return !this.prescriber.missionsManagement;
  }

  get canAccessParticipantsPage() {
    return !this.prescriber.missionsManagement;
  }

  get hasLearnerImportFeature() {
    return this.prescriber.hasOrganizationLearnerImport;
  }
}
