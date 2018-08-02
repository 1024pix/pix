import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  store: service('store'),
  session: service(),
  currentUser: service(),

  model() {
    return this.currentUser.user
      .then((user) => {
        return user.get('organizationAccesses');
      })
      .then((orgaAccesses) => {
        return orgaAccesses.get('firstObject.organization');
      });
  }
});
