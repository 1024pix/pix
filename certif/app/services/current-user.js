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
        const userCertificationCenterMemberships = await user.get('certificationCenterMemberships');
        const userCertificationCenterMembership = await userCertificationCenterMemberships.get('firstObject');
        const certificationCenter = await userCertificationCenterMembership.certificationCenter;

        this.set('user', user);
        this.set('certificationCenter', certificationCenter);
      } catch (error) {
        if (_.get(error, 'errors[0].code') === 401) {
          return this.session.invalidate();
        }
      }
    }
  }
});
