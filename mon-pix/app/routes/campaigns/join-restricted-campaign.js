import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {

  currentUser: service(),

  model(params) {
    return params.campaign_code;
  },

  setupController(controller) {
    this._super(...arguments);
    controller.set('firstName', this.currentUser.user.firstName);
    controller.set('lastName', this.currentUser.user.lastName);
  },
});
