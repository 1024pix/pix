import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  currentCertificationCenter: service(),

  async model() {
    const certificationCenter = await this.currentCertificationCenter.certificationCenter;

    return this.store.createRecord('session', { certificationCenter });
  },

  deactivate: function() {
    if (this.controller.model.hasDirtyAttributes) {
      this.controller.model.deleteRecord();
    }
  },
});
