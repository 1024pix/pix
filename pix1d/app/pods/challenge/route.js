import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ChallengeRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('challenge', params.challenge_number);
  }
}
