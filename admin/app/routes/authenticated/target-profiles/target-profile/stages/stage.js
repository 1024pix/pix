import RSVP from 'rsvp';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class StageRoute extends Route {
  @service store;
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated');
  }

  model(params) {
    return RSVP.hash({
      stage: this.store.findRecord('stage', params.stage_id),
      targetProfile: this.modelFor('authenticated.target-profiles.target-profile'),
    });
  }
}
