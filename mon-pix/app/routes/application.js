import { inject as service } from '@ember/service';

import BaseRoute from 'mon-pix/routes/base-route';

export default BaseRoute.extend({
  splash: service(),

  activate() {
    this.get('splash').hide();
  },

});
