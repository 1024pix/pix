import { inject as service } from '@ember/service';

import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

export default Route.extend(AuthenticatedRouteMixin, {

  session: service(),

  model() {
    return this.store.findRecord('user', this.get('session.data.authenticated.userId'), {
      reload: true
    });
  },
});
