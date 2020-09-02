import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class AssessmentsRoute extends Route {

  queryParams = {
    pageNumber: {
      refreshModel: true,
    },
    pageSize: {
      refreshModel: true,
    },
  };

  model(params) {
    const campaign = this.modelFor('authenticated.campaigns.campaign');
    return RSVP.hash({
      campaign,
      campaignAssessmentParticipationSummaries: this.store.query('campaignAssessmentParticipationSummary', {
        page: {
          number: params.pageNumber,
          size: params.pageSize,
        },
        campaignId: campaign.id,
      }),
    });
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.pageNumber = 1;
      controller.pageSize = 10;
    }
  }
}
