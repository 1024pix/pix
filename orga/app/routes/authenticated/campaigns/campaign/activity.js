import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class ActivityRoute extends Route {
  queryParams = {
    pageNumber: {
      refreshModel: true,
    },
    pageSize: {
      refreshModel: true,
    },
  }

  model(params) {
    const campaign = this.modelFor('authenticated.campaigns.campaign');
    return RSVP.hash({
      campaign,
      participations: this.fetchParticipantsActivity({ campaignId: campaign.id, ...params }),
    });
  }

  fetchParticipantsActivity(params) {
    return this.store.query('campaignParticipantActivity', {
      campaignId: params.campaignId,
      page: {
        number: params.pageNumber,
        size: params.pageSize,
      },
    });
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.pageNumber = 1;
      controller.pageSize = 25;
    }
  }
}
