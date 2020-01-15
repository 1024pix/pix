import Service, { inject as service } from '@ember/service';
import _ from 'lodash';

export default class CurrentUserService extends Service {
  @service session;
  @service store;

  async load() {
    if (this.session.isAuthenticated) {
      try {
        const user = await this.store.queryRecord('user', { me: true });
        const userCertificationCenterMemberships = await user.certificationCenterMemberships;
        const userCertificationCenterMembership = await userCertificationCenterMemberships.firstObject;
        const certificationCenter = await userCertificationCenterMembership.certificationCenter;

        this.user = user;
        this.certificationCenter = certificationCenter;
      } catch (error) {
        if (_.get(error, 'errors[0].code') === 401) {
          return this.session.invalidate();
        }
      }
    }
  }
}
