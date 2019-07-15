import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({

  currentUser: service(),

  model() {
    return this.currentUser.organization;
  },

  afterModel(model) {
    return model.hasMany('memberships').reload();
  }
});
