import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

export default Route.extend(AuthenticatedRouteMixin, {

  currentUser: service(),
  session: service(),
  _isReady: false,

  async beforeModel(transition) {
    this.set('_isReady', false);
    const campaignCode = transition.to.params.campaign_code;
    const student = await this.store.queryRecord('student-user-association', { userId: this.currentUser.user.id, campaignCode });

    if (!isEmpty(student)) {
      return this.replaceWith('campaigns.start-or-resume', campaignCode, {
        queryParams: { associationDone: true }
      });
    }
  },

  model(params) {
    return params.campaign_code;
  },

  afterModel() {
    this.set('_isReady', true);
  },

  setupController(controller) {
    this._super(...arguments);
    if (this.session.data.authenticated.source === 'external') {
      controller.set('firstName', this.currentUser.user.firstName);
      controller.set('lastName', this.currentUser.user.lastName);
    }
  },

  actions: {
    loading() {
      return this._isReady;
    }
  },
});
