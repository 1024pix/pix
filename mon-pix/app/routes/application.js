import { inject as service } from '@ember/service';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

import BaseRoute from 'mon-pix/routes/base-route';

export default BaseRoute.extend(ApplicationRouteMixin, {
  splash: service(),

  activate() {
    this.get('splash').hide();
  },

});
