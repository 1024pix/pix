import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({

  session: service(),
  store: service(),

  beforeModel() {
    if (this.get('session.isAuthenticated')) {
      return this.store
        .findRecord('user', this.get('session.data.authenticated.userId'))
        .then((connectedUser) => {
          if (connectedUser.get('organizations.length')) {
            return this.transitionTo('board');
          }
          if (connectedUser.get('usesProfileV2')) {
            return this.replaceWith('profilv2');
          }
          return this.transitionTo('compte');
        });
    }
    return this.transitionTo('login');
  },
});
