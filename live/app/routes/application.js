import { inject as service } from '@ember/service';

import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend({
  splash: service(),

  activate() {
    this.get('splash').hide();
  }
});
