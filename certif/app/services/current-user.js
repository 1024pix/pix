import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CurrentUserService extends Service {
  @service session;
  @service store;
  @service router;

  @tracked certificationPointOfContact;
  @tracked currentAllowedCertificationCenterAccess;

  async load() {
    if (this.session.isAuthenticated) {
      try {
        this.certificationPointOfContact = await this.store.queryRecord('certification-point-of-contact', {});
        this.currentAllowedCertificationCenterAccess = this.certificationPointOfContact.hasMany('allowedCertificationCenterAccesses').value().firstObject;
      } catch (error) {
        this.certificationPointOfContact = null;
        this.currentAllowedCertificationCenterAccess = null;
        return this.session.invalidate();
      }
    }
  }

  checkRestrictedAccess() {
    if (this.currentAllowedCertificationCenterAccess.isAccessRestricted) {
      return this.router.replaceWith('authenticated.restricted-access');
    }
  }
}
