import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {

  currentUser: service(),

  beforeModel() {
    this._super(...arguments);

    return this.transitionTo('profile');
  },

  async model() {
    const user = this.currentUser.user;
    const organizations = await user.organizations;

    if (organizations.length) {
      return this.transitionTo('board');
    }

    return this.store.queryRecord('user', { profile: true });
  },

  afterModel(model) {
    return model.hasMany('campaignParticipations').reload();
  },

  actions: {

    searchForOrganization(code) {
      return this.store.query('organization', { code })
        .then((organisations) => {
          const isOrganizationFound = organisations.content.length === 1;
          return isOrganizationFound ? organisations.get('firstObject') : null;
        });
    },

    shareProfileSnapshot(organization, studentCode, campaignCode) {
      return this.store.createRecord('snapshot', { organization, studentCode, campaignCode }).save();
    }
  }
});
