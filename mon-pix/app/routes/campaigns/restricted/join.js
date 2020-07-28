import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import { isEmpty } from '@ember/utils';

export default class JoinRoute extends Route.extend(SecuredRouteMixin) {
  @service currentUser;
  @service session;

  model() {
    return this.modelFor('campaigns');
  }

  async redirect(campaign) {
    let schoolingRegistration = await this.store.queryRecord('schooling-registration-user-association', { userId: this.currentUser.user.id, campaignCode: campaign.code });

    if (isEmpty(schoolingRegistration)) {
      schoolingRegistration = await this.store.createRecord('schooling-registration-user-association', { userId: this.currentUser.user.id, campaignCode: campaign.code }).save({ adapterOptions: { tryReconciliation: true } });
    }

    if (!isEmpty(schoolingRegistration)) {
      return this.replaceWith('campaigns.start-or-resume', campaign.code, {
        queryParams: { associationDone: true }
      });
    }
  }

  setupController(controller) {
    super.setupController(...arguments);
    if (this.session.data.authenticated.source === 'external') {
      controller.set('firstName', this.currentUser.user.firstName);
      controller.set('lastName', this.currentUser.user.lastName);
    }
  }
}
