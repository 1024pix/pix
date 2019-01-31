import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  currentCertificationCenter: service(),

  async model() {
    const certificationCenter = await this.currentCertificationCenter.certificationCenter;

    return this.get('store').createRecord('session', { certificationCenter });
  }
});
