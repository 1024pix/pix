import Route from '@ember/routing/route';
import { inject } from '@ember/service';

export default Route.extend({
  session: inject(),

  beforeModel() {
    this._super(...arguments);
    if (this.get('session.isAuthenticated')) {
      this.get('session').invalidate();
    }
  }
});
