import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {

  session: service(),

  async model() {
    const user = await this.store.queryRecord('user', { profile: true });

    const organizations = await user.organizations;

    if (organizations.length) {
      return this.transitionTo('board');
    }

    return user;
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
