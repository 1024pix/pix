import { inject as service } from '@ember/service';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend(UnauthenticatedRouteMixin, {

  session: service(),

  model(params) {
    return RSVP.hash({
      user: this.store.findRecord('password-reset-demand', params.temporary_key),
      temporaryKey: params.temporary_key
    });
  }

});
