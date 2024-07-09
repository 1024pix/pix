import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CertificationRoute extends Route {
  @service store;

  async model() {
    return this.store.queryRecord('flash-algorithm-configuration', {
      id: 0,
    });
  }
}
