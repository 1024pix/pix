import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class CollectiveResultsRoute extends Route {
  queryParams = {
    view: {
      refreshModel: true
    },
  };

  redirect(model, transition) {
    const { view } = transition.to.queryParams;
    if (!['competence', 'tube'].includes(view)) {
      this.replaceWith(transition.to.name, { queryParams: { view: 'competence' } });
    }
  }

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
