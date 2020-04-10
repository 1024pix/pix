import Service, { inject as service } from '@ember/service';
import _ from 'lodash';

export default class CurrentUserService extends Service {

  @service session;
  @service store;

  async load() {
    if (this.get('session.isAuthenticated')) {
      try {
        const user = await this.store.queryRecord('user', { me: true });
        const userMemberships = await user.get('memberships');
        const userOrgaSettings = await user.get('userOrgaSettings');

        this.set('user', user);
        this.set('memberships', userMemberships);

        let membership;
        if (userOrgaSettings) {
          membership = await this._getMembershipByUserOrgaSettings(userMemberships.toArray(), userOrgaSettings);
          if (!membership) {
            membership = await userMemberships.firstObject;
            await this._updateUserOrgaSettings(userOrgaSettings, membership);
          }
        } else {
          membership = await userMemberships.firstObject;
          await this._createUserOrgaSettings(user, membership);
        }

        await this._setOrganizationProperties(membership);

      } catch (error) {
        if (_.get(error, 'errors[0].code') === 401) {
          return this.session.invalidate();
        }
      }
    }
  }

  get isSCOManagingStudents() {
    return this.organization.isSco && this.organization.isManagingStudents;
  }

  async _getMembershipByUserOrgaSettings(memberships, userOrgaSettings) {
    const organization = await userOrgaSettings.get('organization');
    for (let i = 0; i < memberships.length; i++) {
      const membershipOrganization = await memberships[i].get('organization');
      if (membershipOrganization.id === organization.id) {
        return memberships[i];
      }
    }
    return null;
  }

  async _updateUserOrgaSettings(userOrgaSettings, membership) {
    userOrgaSettings.organization = await membership.organization;
    userOrgaSettings.save();
  }

  async _createUserOrgaSettings(user, membership) {
    const organization = await membership.organization;
    await this.store.createRecord('user-orga-setting', { user, organization }).save();
  }

  async _setOrganizationProperties(membership) {
    const organization = await membership.organization;
    const isAdminInOrganization = membership.isAdmin;
    this.set('organization', organization);
    this.set('isAdminInOrganization', isAdminInOrganization);
  }
}
