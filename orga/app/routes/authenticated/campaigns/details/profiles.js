import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class ProfilesRoute extends Route {
  queryParams = {
    pageNumber: {
      refreshModel: true
    },
    pageSize: {
      refreshModel: true
    }
  };

  model(params) {
    const campaign = this.modelFor('authenticated.campaigns.details');
    return RSVP.hash({
      campaign,
      profiles: this.store.query('CampaignProfilesCollectionParticipationSummary', {
        filter: {
          campaignId: campaign.id,
        },
        page: {
          number: params.pageNumber,
          size: params.pageSize,
        },
      }),
    });
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('pageNumber', 1);
      controller.set('pageSize', 10);
    }
  }
}

