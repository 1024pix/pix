import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class ListRoute extends Route {
  @service currentUser;

  model() {
    return this.currentUser.organization;
  }

  afterModel(model) {
    return Promise.all([
      model.hasMany('memberships').reload(),
      model.hasMany('organizationInvitations').reload(),
    ]);
  }
}
