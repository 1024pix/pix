import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class CollectiveResultsRoute extends Route {
  queryParams = {
    view: {
      refreshModel: true
    },
  };

  model(params) {
    const campaign = this.modelFor('authenticated.campaigns.details');
    return RSVP.hash({
      campaignReport: campaign.campaignReport,
      campaignCollectiveResult: this.store.queryRecord('campaignCollectiveResult', {
        filter: {
          campaignId: campaign.id,
          view: params.view,
        },
      }),
    });
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('view', null);
    }
  }
}
