import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({

  session: service(),
  store: service(),

  actions: {
    submit() {
      const store = this.store;
      const userId = this.get('session.data.authenticated.user_id');
      const loggedUser = store.peekRecord('user', userId);
      loggedUser.set('pixOrgaTermsOfServiceAccepted', true);

      return loggedUser.save().then(() => {
        return this.transitionToRoute('authenticated.campaigns');
      });
    }
  }
});
