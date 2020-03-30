import classic from 'ember-classic-decorator';
import Route from '@ember/routing/route';

@classic
export default class AssessmentsRoute extends Route {
  model(params) {
    return this.store.findRecord('assessment', params.assessment_id);
  }
}
