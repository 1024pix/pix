import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';

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
  @tracked isCFA;

  async load() {
    if (this.session.isAuthenticated) {
      try {
        this.prescriber = await this.store.queryRecord('prescriber', this.session.data.authenticated.user_id);
        this.memberships = await this.prescriber.memberships;
        const userOrgaSettings = await this.prescriber.userOrgaSettings;
        const membership = await this._getMembershipByUserOrgaSettings(this.memberships.toArray(), userOrgaSettings);

        await this._setOrganizationProperties(membership);
      } catch (error) {
        const errorCode = get(error, 'errors[0].code');
        if ([401, 403].includes(errorCode)) {
          return this.session.invalidate();
        }
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
    this.isCFA = organization.isCFA;

    this.organization = organization;
  }
}
