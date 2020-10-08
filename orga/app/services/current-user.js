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

  async load() {
    if (this.session.isAuthenticated) {
      try {
        this.prescriber = await this.store.queryRecord('prescriber', this.session.data.authenticated.user_id);
        this.memberships = await this.prescriber.memberships;
        const userOrgaSettings = await this.prescriber.userOrgaSettings;

        let membership;
        if (userOrgaSettings) {
          membership = await this._getMembershipByUserOrgaSettings(this.memberships.toArray(), userOrgaSettings);
          if (!membership) {
            membership = await this.memberships.firstObject;
            await this._updateUserOrgaSettings(userOrgaSettings, membership, this.prescriber.id);
          }
        } else {
          const userId = this.prescriber.id;
          membership = await this.memberships.firstObject;
          const organization = membership.organization;
          await this._createUserOrgaSettings({ userId, organization });
        }

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

  async _updateUserOrgaSettings(userOrgaSettings, membership, userId) {
    userOrgaSettings.organization = await membership.organization;
    userOrgaSettings.save({ adapterOptions: { userId } });
  }

  async _createUserOrgaSettings({ userId, organization }) {
    await this.store.createRecord('user-orga-setting', { organization }).save({ adapterOptions: { userId } });
  }

  async _setOrganizationProperties(membership) {
    const organization = await membership.organization;
    const isAdminInOrganization = membership.isAdmin;
    const isSCOManagingStudents = organization.isSco && organization.isManagingStudents;
    const isSUPManagingStudents = organization.isSup && organization.isManagingStudents;

    this.organization = organization;
    this.isAdminInOrganization = isAdminInOrganization;
    this.isSCOManagingStudents = isSCOManagingStudents;
    this.isSUPManagingStudents = isSUPManagingStudents;
    this.isAgriculture = organization.isAgriculture;
  }
}
