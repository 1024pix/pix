import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class UpdateRoute extends Route {
  @service currentUser;
  @service store;
  @service router;

  async model(params) {
    const organization = this.currentUser.organization;
    const campaign = await this.store.findRecord('campaign', params.campaign_id);

    const membersSortedByFullName = await this.store.findAll('member-identity', {
      adapterOptions: { organizationId: organization.id },
    });

    return { campaign, membersSortedByFullName };
  }

  afterModel(model, transition) {
    const isCurrentUserAdmin = this.currentUser.prescriber.isAdminOfTheCurrentOrganization;
    const isCurrentUserOwnerOfTheCampaign = parseInt(this.currentUser.prescriber.id) === model.campaign.ownerId;
    if (!isCurrentUserAdmin && !isCurrentUserOwnerOfTheCampaign) {
      transition.abort();
      this.router.transitionTo('authenticated.campaigns');
    }
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.campaignName = model.campaign.name;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.get('model').campaign.rollbackAttributes();
    }
  }
}
