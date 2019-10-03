import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({

  currentUser: service(),

  actions: {
    async submit() {
      await this.currentUser.user.save({ adapterOptions: { acceptPixOrgaTermsOfService: true } });
      return this.transitionToRoute('authenticated.campaigns');
    }
  }
});
