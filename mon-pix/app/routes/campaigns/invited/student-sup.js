import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

export default class StudentSupRoute extends Route.extend(SecuredRouteMixin) {
  @service currentUser;
  @service campaignStorage;
  @service store;
  @service router;

  model() {
    return this.modelFor('campaigns');
  }

  async afterModel(campaign) {
    const organizationLearner = await this.store.queryRecord('organization-learner-identity', {
      userId: this.currentUser.user.id,
      campaignCode: campaign.code,
    });

    if (organizationLearner) {
      this.campaignStorage.set(campaign.code, 'associationDone', true);
      this.router.replaceWith('campaigns.invited.fill-in-participant-external-id', campaign.code);
    }
  }
}
