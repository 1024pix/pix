import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
export default class AssessmentResultsRoute extends Route {
  @service store;

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
    search: {
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
        search: params.search,
      },
      campaignId: params.campaignId,
    });
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.pageNumber = 1;
      controller.pageSize = 50;
      controller.divisions = [];
      controller.groups = [];
      controller.badges = [];
      controller.stages = [];
      controller.search = null;
    }
  }
}
