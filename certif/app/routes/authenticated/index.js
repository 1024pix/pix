import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({

  currentUser: service(),

  beforeModel() {
    return this.get('currentUser').load()
      .then((user) => {
        if (user.pixCertifTermsOfServiceAccepted) {
            return this.transitionTo('authenticated.sessions.list');
        } else {
          return this.transitionTo('authenticated.terms-of-service');
        }
      })
      .catch((error) => {
        this.get('session').invalidate();
        throw error;
      });
  }
});
