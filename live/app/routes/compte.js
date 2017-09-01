import Ember from 'ember';

import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {

  authenticationRoute: '/connexion',
  session: Ember.inject.service(),

  model() {
    const store = this.get('store');
    return store.findRecord('user', this.get('session.data.authenticated.userId'), { reload: true })
      .then(user => {
        if (user.get('organizations.length') > 0) {
          return this.transitionTo('board');
        }
        return user;
      })
      .catch(_ => {
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
    },

    shareProfileSnapshot(organization) {
      return this.get('store').createRecord('snapshot', { organization }).save();
    }
  }
});
