import Service from '@ember/service';
import { inject as service } from '@ember/service';
import _ from 'lodash';

export default Service.extend({

  session: service(),
  store: service(),

  async load() {
    if (this.get('session.isAuthenticated')) {
      try {
        const userId = this.get('session.data.authenticated.user_id');
        const user = await this.store.findRecord('user', userId);
        const userMemberships = await user.get('memberships');
        const userMembership = await userMemberships.get('firstObject');
        const organization = await userMembership.organization;
        const isOwnerInOrganization = userMembership.isOwner;
        const canAccessStudentsPage = organization.isSco && organization.isManagingStudents;

        this.set('user', user);
        this.set('organization', organization);
        this.set('isOwnerInOrganization', isOwnerInOrganization);
        this.set('canAccessStudentsPage', canAccessStudentsPage);
      } catch (error) {
        if (_.get(error, 'errors[0].code') === 401) {
          return this.session.invalidate();
        }
      }
    }
  }
});
