import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class FrameworkRoute extends Route {
  @service store;

  async model() {
    const frameworks = await this.store.findAll('framework');
    const item = await this.modelFor('authenticated.certification-frameworks.item');
    return RSVP.hash({
      frameworks,
      scope: item.frameworkKey,
    });
  }
}
