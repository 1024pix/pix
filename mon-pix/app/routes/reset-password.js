import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import Route from '@ember/routing/route';

export default Route.extend(UnauthenticatedRouteMixin, {

  model(params) {
    const passwordResetData = {
      password: '',
      temporaryKey: params.temporary_key,
    };

    return this.store.createRecord('password-reset', passwordResetData);
  },

});
