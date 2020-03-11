import Service from '@ember/service';
import { inject as service } from '@ember/service';
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

        if (userOrgaSettings) {
          const organization = await userOrgaSettings.get('organization');
          const userMembership = await this._getMembershipByOrganizationId(userMemberships.toArray(), organization.id);
          await this._setOrganizationProperties(userMembership);
        } else {
          const membership = await userMemberships.firstObject;
          const organization = await membership.organization;
          await this.store.createRecord('user-orga-setting', { user, organization }).save();
          await this._setOrganizationProperties(membership);
        }
      } catch (error) {
        if (_.get(error, 'errors[0].code') === 401) {
          return this.session.invalidate();
        }
      }
    }
  }

  async _getMembershipByOrganizationId(memberships, organizationId) {
    for (let i = 0; i < memberships.length; i++) {
      const membershipOrganization = await memberships[i].get('organization');
      if (membershipOrganization.id === organizationId) {
        return memberships[i];
      }
    }
    return null;
  }

  async _setOrganizationProperties(membership) {
    const organization = await membership.organization;
    const isAdminInOrganization = membership.isAdmin;
    const canAccessStudentsPage = organization.isSco && organization.isManagingStudents;
    this.set('organization', organization);
    this.set('isAdminInOrganization', isAdminInOrganization);
    this.set('canAccessStudentsPage', canAccessStudentsPage);
  }
}
