import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class UpdateRoute extends Route {
  @service currentUser;

  async model(params) {
    const organization = this.currentUser.organization;
    const campaign = await this.store.findRecord('campaign', params.campaign_id);

    const memberships = await this.store.query('membership', {
      filter: {
        organizationId: organization.id,
      },
      page: {
        size: 500,
      },
    });
    const members = memberships.map((membership) => membership.user);
    const membersSortedByFullName = members.sortBy('firstName', 'lastName');

    return { campaign, membersSortedByFullName };
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
