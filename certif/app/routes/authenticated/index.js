import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({

  currentUser: service(),

  beforeModel() {
    const transition = this._selectTransition(this.currentUser);

    return this.transitionTo(transition);
  },

  _selectTransition({ pixOrgaTermsOfServiceAccepted }) {
    if (!pixOrgaTermsOfServiceAccepted) {
      return 'authenticated.terms-of-service';
    }

    return 'authenticated.sessions.list';
  }
});
