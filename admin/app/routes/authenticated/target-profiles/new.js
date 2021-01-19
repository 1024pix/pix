import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default class NewRoute extends Route.extend(AuthenticatedRouteMixin) {
  model() {
    return this.store.createRecord('target-profile');
  }
}
