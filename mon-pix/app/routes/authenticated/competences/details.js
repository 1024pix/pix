import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class DetailsRoute extends Route {
  @service currentUser;
  @service store;

  model(params, transition) {
    const scorecardId = this.currentUser.user.id + '_' + transition.to.parent.params.competence_id;
    return this.store.peekRecord('scorecard', scorecardId, {
      reload: true,
    });
  }

  afterModel(scorecard) {
    return scorecard.hasMany('tutorials').reload();
  }
}
