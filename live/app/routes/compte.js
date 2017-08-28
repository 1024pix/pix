import Ember from 'ember';

import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {

  authenticationRoute: '/connexion',

  model() {
    const store = this.get('store');
    return store.queryRecord('user', {}).catch(_ => {
      this.transitionTo('logout');
    });
  },

  actions: {
    searchForOrganization(code) {
      return this.get('store').query('organization', {
        filter: {
          code
        }
      }).then((organisations) => {
        const isOrganizationFound = organisations.content.length === 1;

        return isOrganizationFound ? organisations.get('firstObject') : null;
      });
    }
  }

});
