import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexMissionRoute extends Route {
  @service router;

  beforeModel() {
    return this.router.replaceWith('authenticated.missions.mission.activities');
  }
}
