import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ComplementaryCertificationRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('complementary-certification', params.complementary_certification_id, {
      reload: true,
    });
  }
}
