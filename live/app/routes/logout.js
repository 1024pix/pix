import { inject as service } from '@ember/service';

import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend({

  session: service(),

  beforeModel() {
    const session = this.get('session');
    if (session.get('isAuthenticated')) {
      session.invalidate();
    }
    this.transitionTo('/');
  }

});
