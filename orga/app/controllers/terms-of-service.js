import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({

  currentUser: service(),
  store: service(),

  actions: {
    async submit() {
      const user = this.currentUser.user;
      await user.save({ adapterOptions: { acceptPixOrgaTermsOfService: true } });

      const userOrgaSettings = await user.userOrgaSettings;
      if (!userOrgaSettings) {
        const organization = this.currentUser.organization;
        this.store.createRecord('user-orga-setting', { user, organization }).save();
      }

      return this.replaceRoute('');
    }
  }
});
