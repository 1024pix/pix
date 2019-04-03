import RSVP from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

export default Route.extend(AuthenticatedRouteMixin, {

  model(params) {
    return RSVP.hash({
      user: this.store.queryRecord('user', { profile: true }),
      certificationNumber: params.certification_number // FIXME certification number is a domain attribute and should not be queried as a technical id
    });
  }
});
