import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class AssessmentResultsRoute extends Route {
  queryParams = {
    pageNumber: {
      refreshModel: true,
    },
    pageSize: {
      refreshModel: true,
    },
    divisions: {
      refreshModel: true,
    },
    badges: {
      refreshModel: true,
    },
    stages: {
      refreshModel: true,
    },
  };

  async model(params) {
    const campaign = this.modelFor('authenticated.campaigns.campaign');
    await campaign.belongsTo('campaignCollectiveResult').reload();
    return RSVP.hash({
      campaign,
      participations: this.fetchResultMinimalList({ campaignId: campaign.id, ...params }),
    });
  }

  fetchResultMinimalList(params) {
    return this.store.query('campaignAssessmentResultMinimal', {
      page: {
        number: params.pageNumber,
        size: params.pageSize,
      },
      filter: {
        divisions: params.divisions,
        badges: params.badges,
        stages: params.stages,
      },
      campaignId: params.campaignId,
    });
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.pageNumber = 1;
      controller.pageSize = 25;
      controller.divisions = [];
      controller.badges = [];
      controller.stages = [];
    }
  }
}
