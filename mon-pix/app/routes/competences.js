import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class CompetencesRoute extends Route {
  @service currentUser;
  @service session;
  @service store;

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  model(params) {
    const scorecardId = this.currentUser.user.id + '_' + params.competence_id;
    return this.store.findRecord('scorecard', scorecardId);
  }
}
