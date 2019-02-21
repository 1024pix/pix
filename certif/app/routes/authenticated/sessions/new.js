import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import moment from 'moment';

export default Route.extend({
  currentCertificationCenter: service(),

  async model() {
    const certificationCenter = await this.currentCertificationCenter.certificationCenter;
    const date = moment(moment.now(), 'DD/MM/YYYY');

    return this.store.createRecord('session', { certificationCenter, date });
  },

  deactivate: function() {
    if (this.controller.model.hasDirtyAttributes) {
      this.controller.model.deleteRecord();
    }
  },
});
