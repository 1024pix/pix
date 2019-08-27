import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  currentUser: service(),

  model() {
    return this.store.createRecord('session', { certificationCenter: this.currentUser.certificationCenter });
  },

  deactivate: function() {
    if (this.controller.model.hasDirtyAttributes) {
      this.controller.model.deleteRecord();
    }
  },
});
