import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  currentUser: service(),
  showCongratulationsBanner: true,
  actions: {
    closeBanner() {
      this.toggleProperty('showCongratulationsBanner');
    },
  }
});
