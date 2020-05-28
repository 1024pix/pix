import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class ParticipantsRoute extends Route {

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
      campaignAssessmentParticipationSummaries: this.store.query('campaignAssessmentParticipationSummary', {
        page: {
          number: params.pageNumber,
          size: params.pageSize,
        },
        campaignId: campaign.id
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
