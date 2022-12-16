import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class CompetencesRoute extends Route {
  @service currentUser;
  @service store;

  model(params) {
    const scorecardId = this.currentUser.user.id + '_' + params.competence_id;
    return this.store.findRecord('scorecard', scorecardId);
  }
}
