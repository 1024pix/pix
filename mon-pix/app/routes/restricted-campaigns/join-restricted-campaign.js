import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import { isEmpty } from '@ember/response-objects';

export default class JoinRestrictedCampaignRoute extends Route.extend(SecuredRouteMixin) {
  @service currentUser;
  @service session;

  async beforeModel(transition) {
    const campaignCode = transition.to.parent.params.campaign_code;
    const student = await this.store.queryRecord('student-user-association', { userId: this.currentUser.user.id, campaignCode });

    if (!isEmpty(student)) {
      this.replaceWith('campaigns.start-or-resume', campaignCode, {
        queryParams: { associationDone: true }
      });
    }
  }

  model() {
    return this.paramsFor('restricted-campaigns').campaign_code;
  }

  setupController(controller) {
    super.setupController(...arguments);
    if (this.session.data.authenticated.source === 'external') {
      controller.set('firstName', this.currentUser.user.firstName);
      controller.set('lastName', this.currentUser.user.lastName);
    }
  }
}
