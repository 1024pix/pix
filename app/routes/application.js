import Route from '@ember/routing/route';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(ApplicationRouteMixin, {
  notifications: service('notification-messages'),
  routeAfterAuthentication: 'authenticated.organizations.list',

  init() {
    this._super(...arguments);
    this.get('notifications').setDefaultAutoClear(true);
  }
});
