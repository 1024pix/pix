import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MissionRoute extends Route {
  @service router;
  @service store;

  model(params, transition) {
    const mission = this.store.peekRecord('mission', transition.to.parent.params.mission_id);
    return this.store.queryRecord('assessment', { missionId: mission.id });
  }

  afterModel(assessment) {
    return this.router.replaceWith('assessment.challenge', assessment);
  }
}
