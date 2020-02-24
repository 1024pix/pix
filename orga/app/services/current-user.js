import Service from '@ember/service';
import { inject as service } from '@ember/service';
import _ from 'lodash';

export default Service.extend({

  session: service(),
  store: service(),

  async load() {
    if (this.get('session.isAuthenticated')) {
      try {
        const user = await this.store.queryRecord('user', { me: true });
        const userMemberships = await user.get('memberships');
        const userOrgaSettings = await user.get('userOrgaSettings');

        this.set('user', user);

        if (userOrgaSettings) {
          const organization = await userOrgaSettings.get('organization');
          const userMembership = await this._getMembershipByOrganizationId(userMemberships.toArray(), organization.id);
          const isAdminInOrganization = userMembership.isAdmin;
          const canAccessStudentsPage = organization.isSco && organization.isManagingStudents;
          this.set('organization', organization);
          this.set('isAdminInOrganization', isAdminInOrganization);
          this.set('canAccessStudentsPage', canAccessStudentsPage);
        }
      } catch (error) {
        if (_.get(error, 'errors[0].code') === 401) {
          return this.session.invalidate();
        }
      }
    }
  },

  async _getMembershipByOrganizationId(memberships, organizationId) {
    for (let i = 0; i < memberships.length; i++) {
      const membershipOrganization = await memberships[i].get('organization');
      if (membershipOrganization.id === organizationId) {
        return memberships[i];
      }
    }
    return null;
  }

});
