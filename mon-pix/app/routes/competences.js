import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({

  currentUser: service(),

  model(params) {
    if (!this.currentUser.user) {
      return;
    }
    return this.store.findRecord('scorecard',
      this.currentUser.user.id + '_' + params.competence_id);
  },

});
