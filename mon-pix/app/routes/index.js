import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {

  currentUser: service(),

  model() {
    const usesProfileV2 = this.currentUser.get('user.usesProfileV2');

    if (usesProfileV2) {
      return this.transitionTo('profile-v2');
    }

    return this.transitionTo('compte');
  },
});
