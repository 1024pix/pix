import { inject as service } from '@ember/service';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import Route from '@ember/routing/route';

export default Route.extend(ApplicationRouteMixin, {

  splash: service(),

  activate() {
    this.splash.hide();
  },

  // XXX: For override the sessionInvalidated from ApplicationRouteMixin to avoid the automatic redirection
  sessionInvalidated() {},

});
