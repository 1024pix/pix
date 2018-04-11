import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {

  beforeModel() {
    this._super(...arguments);
    this.transitionTo('authenticated.organizations.new');
  }

});
