import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  session: service(),

  beforeModel() {
    this._super(...arguments);
    if (this.get('session.isAuthenticated')) {
      return this.get('session').invalidate();
    }
    return this.transitionTo('login');
  }

});
