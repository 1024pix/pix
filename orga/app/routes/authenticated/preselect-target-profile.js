import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class PreselectTargetProfileRoute extends Route {
  @service currentUser;
  @service store;

  async model() {
    const organization = this.currentUser.organization;
    const frameworks = this.store.query('framework', {});

    return RSVP.hash({
      organization,
      frameworks,
    });
  }
}
