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

  async load() {
    if (this.session.isAuthenticated) {
      try {
        const prescriber = await this.store.queryRecord('prescriber', this.session.data.authenticated.user_id);
        const userMemberships = await prescriber.memberships;
        const userOrgaSettings = await prescriber.userOrgaSettings;

        if (!userMemberships || userMemberships.length === 0) {
          return this.session.invalidate();
        }

        this.prescriber = prescriber;
        this.memberships = userMemberships;

        let membership;
        if (userOrgaSettings) {
          membership = await this._getMembershipByUserOrgaSettings(userMemberships.toArray(), userOrgaSettings);
          if (!membership) {
            membership = await userMemberships.firstObject;
            await this._updateUserOrgaSettings(userOrgaSettings, membership, prescriber.id);
          }
        } else {
          const userId = prescriber.id;
          membership = await userMemberships.firstObject;
          const organization = membership.organization;
          await this._createUserOrgaSettings({ userId, organization });
        }

        await this._setOrganizationProperties(membership);

      } catch (error) {
        if (get(error, 'errors[0].code') === 401) {
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
  }
}
