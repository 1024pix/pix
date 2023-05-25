import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AssessmentsRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('assessment', params.assessment_id);
  }
}
