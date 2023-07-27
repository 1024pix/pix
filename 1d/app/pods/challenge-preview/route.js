import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ChallengePreviewRoute extends Route {
  @service router;
  @service store;

  model(params) {
    return this.store.findRecord('challenge', params.challenge_id);
  }
}
