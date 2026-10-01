import Service, { service } from '@ember/service';
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
  @tracked isGarAuthenticationMethod;
  @tracked organizationPlaceStatistics;
  @tracked participationStatistics;
  @tracked combinedCourseBlueprints;

  get canAccessImportPage() {
    return Boolean(this.hasImportFeature && this.isAdminInOrganization);
  }

  get hasImportFeature() {
    return this.organization.isManagingStudents || this.hasLearnerImportFeature;
  }

  get canAccessAttestationsPage() {
    return this.prescriber.attestationsManagement && this.isAdminInOrganization;
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

  get hasLearnerImportFeature() {
    return this.prescriber.hasOrganizationLearnerImport;
  }

  get canActivateOralizationLearner() {
    return this.prescriber.hasOralizationFeature;
  }

  get canAccessStatisticsPage() {
    return this.isAdminInOrganization && this.prescriber.hasCoverRateFeature;
  }

  get canEditLearnerName() {
    return this.isAdminInOrganization && !this.hasImportFeature;
  }

  get placeStatistics() {
    return this.organizationPlaceStatistics;
  }

  async loadCombinedCourseBlueprints() {
    this.combinedCourseBlueprints = await this.organization.combinedCourseBlueprints;
  }

  async loadDivisions() {
    if (this.organization.isManagingStudents) {
      if (this.organization.isSco) return this.organization.divisions;
      if (this.organization.isSup) return this.organization.groups;
    }
    return null;
  }

  get hasCombinedCourseBlueprints() {
    return Boolean(this.combinedCourseBlueprints && this.combinedCourseBlueprints.length > 0);
  }

  async loadPlaceStatistics() {
    if (this.prescriber?.placesManagement) {
      this.organizationPlaceStatistics = await this.store.queryRecord('organization-place-statistic', {
        organizationId: this.organization.id,
      });
    } else {
      this.organizationPlaceStatistics = null;
    }
  }

  async loadParticipationStatistics() {
    this.participationStatistics = await this.organization.participationStatistics;
  }

  async load() {
    if (!this.session.isAuthenticated) return;

    try {
      this.prescriber = await this.store.findRecord('prescriber', this.session.data.authenticated.user_id, {
        reload: true,
      });
      this.memberships = await this.prescriber.memberships;
      const userOrgaSettings = await this.prescriber.userOrgaSettings;
      const membership = await this._getMembershipByUserOrgaSettings(this.memberships.slice(), userOrgaSettings);
      await this._setOrganizationProperties(membership);

      await membership.save({
        adapterOptions: { updateLastAccessedAt: true },
      });
    } catch (responseError) {
      this.prescriber = null;
      this.memberships = null;
      const error = responseError?.errors[0];
      throw error;
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
    this.isGarAuthenticationMethod = organization.identityProviderForCampaigns === 'GAR';
    this.isAgriculture = organization.isAgriculture;
    this.organization = organization;
    await this.loadPlaceStatistics();
    await this.loadCombinedCourseBlueprints();
    await this.loadParticipationStatistics();
  }
}
