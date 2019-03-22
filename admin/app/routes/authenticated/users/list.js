import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {

  model() {
    // ℹ️ We use `#query` instead of `#findAll` because only the first one handle metadata
    return this.store.query('user', {});
  }

});
