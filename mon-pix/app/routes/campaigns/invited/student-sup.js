import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

export default class StudentSupRoute extends Route.extend(SecuredRouteMixin) {
  @service currentUser;
  @service campaignStorage;
  @service store;

  model() {
    return this.modelFor('campaigns');
  }

  async afterModel(campaign) {
    const schoolingRegistration = await this.store.queryRecord('schooling-registration-user-association', {
      userId: this.currentUser.user.id,
      campaignCode: campaign.code,
    });

    if (schoolingRegistration) {
      this.campaignStorage.set(campaign.code, 'associationDone', true);
      this.replaceWith('campaigns.invited.fill-in-participant-external-id', campaign.code);
    }
  }
}
