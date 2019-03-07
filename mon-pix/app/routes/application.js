import { inject as service } from '@ember/service';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import BaseRoute from 'mon-pix/routes/base-route';

export default BaseRoute.extend(ApplicationRouteMixin, {

  splash: service(),
  pixModalDialog: service(),

  activate() {
    this.get('splash').hide();
  },

  // XXX: For override the sessionInvalidated from ApplicationRouteMixin to avoid the automatic redirection
  sessionInvalidated() {},

  actions: {
    willTransition() {
      /*
       * Assert that page scrolling is restored after navigating to a view.
       * Fix "navigation back" from a routed pix-modal-dialog route
       */
      this.pixModalDialog.disableScrolling();
    }
  }

});
