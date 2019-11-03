import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

export default Route.extend(AuthenticatedRouteMixin, {

  currentUser: service(),

  async beforeModel(transition) {
    const student = await this.store.queryRecord('student', { userId: this.currentUser.user.id });

    if (!isEmpty(student)) {
      return this.replaceWith('campaigns.start-or-resume', transition.to.params.campaign_code, {
        queryParams: { associationDone: true }
      });
    }
  },

  model(params) {
    return params.campaign_code;
  },

  setupController(controller) {
    this._super(...arguments);
    controller.set('firstName', this.currentUser.user.firstName);
    controller.set('lastName', this.currentUser.user.lastName);
  },
});
