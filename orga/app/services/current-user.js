import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';

export default class CurrentUserService extends Service {
  @service session;
  @service store;
  @service router;
  @service pixToast;

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
  @tracked combinedCourses;

  get canAccessImportPage() {
    return Boolean(
      (this.isSCOManagingStudents || this.isSUPManagingStudents || this.hasLearnerImportFeature) &&
      this.isAdminInOrganization,
    );
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
    return this.isAdminInOrganization && !this.hasLearnerImportFeature && !this.organization.isManagingStudents;
  }

  get placeStatistics() {
    return this.organizationPlaceStatistics;
  }

  async loadCombinedCourses() {
    this.combinedCourses = await this.organization.combinedCourses;
  }

  async loadDivisions() {
    if (this.organization.isManagingStudents) {
      if (this.organization.isSco) return this.organization.divisions;
      if (this.organization.isSup) return this.organization.groups;
    }
    return null;
  }

  get hasCombinedCourses() {
    return Boolean(this.combinedCourses && this.combinedCourses.length > 0);
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
    if (this.session.isAuthenticated) {
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
      } catch (error) {
        // Handling error for those different cases: EmberSimpleAuth, JSON:API response, non-JSON:API response
        const extractedError = get(error, error.responseJSON ? 'responseJSON.errors[0]' : 'errors[0]') ?? error;
        if (extractedError.code == 'USER_NOT_MEMBER_OF_ORGANIZATION') {
          this.session.alternativeRootURL = 'error';
          // await this.session.invalidate();
          //this.router.transitionTo('authentication.login', { queryParams: { error: error.code } });
        }

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
    this.isGarAuthenticationMethod = organization.identityProviderForCampaigns === 'GAR';
    this.isAgriculture = organization.isAgriculture;
    this.organization = organization;
    await this.loadPlaceStatistics();
    await this.loadCombinedCourses();
    await this.loadParticipationStatistics();
  }
}
