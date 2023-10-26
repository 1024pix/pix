import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MissionRoute extends Route {
  @service router;
  @service store;

  model(params, transition) {
    //TODO Ajouter le learner
    return this.store.queryRecord('assessment', { missionId: transition.to.parent.params.mission_id });
  }

  afterModel(assessment) {
    return this.router.replaceWith('assessment.challenge', assessment);
  }
}
