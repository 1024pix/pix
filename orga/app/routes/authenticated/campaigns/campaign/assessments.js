import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { action } from '@ember/object';

export default class AssessmentsRoute extends Route {
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

  @action
  loading(transition) {
    if (transition.from && transition.from.name === 'authenticated.campaigns.campaign.assessments') {
      return false;
    }
  }

  model(params) {
    const campaign = this.modelFor('authenticated.campaigns.campaign');
    return RSVP.hash({
      campaign,
      campaignAssessmentParticipationSummaries: this.fetchSummaries({ campaignId: campaign.id, ...params }),
    });
  }

  fetchSummaries(params) {
    return this.store.query('campaignAssessmentParticipationSummary', {
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
