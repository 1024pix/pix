import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { action } from '@ember/object';

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
    groups: {
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
    return RSVP.hash({
      campaign,
      participations: this.fetchResultMinimalList({ campaignId: campaign.id, ...params }),
    });
  }

  @action
  loading(transition) {
    if (transition.from && transition.from.name === 'authenticated.campaigns.campaign.assessment-results') {
      return false;
    }
  }

  fetchResultMinimalList(params) {
    return this.store.query('campaignAssessmentResultMinimal', {
      page: {
        number: params.pageNumber,
        size: params.pageSize,
      },
      filter: {
        divisions: params.divisions,
        groups: params.groups,
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
      controller.groups = [];
      controller.badges = [];
      controller.stages = [];
    }
  }
}
