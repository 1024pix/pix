import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class FrameworkEditRoute extends Route {
  @service store;

  async model(params) {
    const version = await this.store.findRecord('certification-version', params.version_id);
    const item = await this.modelFor('authenticated.certification-frameworks.item');
    return RSVP.hash({
      scope: item.frameworkKey,
      version,
    });
  }
}
