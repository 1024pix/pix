import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default Route.extend(UnauthenticatedRouteMixin, {
  session: service(),

  beforeModel() {
    this._super(...arguments);
    this.get('session').invalidate();
    return this.transitionTo('login');
  }

});
