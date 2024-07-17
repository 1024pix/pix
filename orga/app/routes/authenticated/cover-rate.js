import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AuthenticatedCoverRate extends Route {
  @service currentUser;
  @service router;
  @service store;

  model() {
    const organization = this.currentUser.organization;
    return this.store.findRecord('cover-rate', organization.id);
  }
}
