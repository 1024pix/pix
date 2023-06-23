import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class RestrictedAccessRoute extends Route {
  @service router;
  @service currentUser;

  beforeModel() {
    if (!this.currentUser.currentAllowedCertificationCenterAccess.isAccessRestricted) {
      this.router.replaceWith('authenticated');
    }
  }

  model() {
    return this.currentUser.currentAllowedCertificationCenterAccess;
  }
}
