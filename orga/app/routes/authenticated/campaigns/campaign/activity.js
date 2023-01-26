import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
export default class ActivityRoute extends Route {
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
    status: {
      refreshModel: true,
    },
    groups: {
      refreshModel: true,
    },
    search: {
      refreshModel: true,
    },
  };

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
      filter: {
        divisions: params.divisions,
        status: params.status,
        groups: params.groups,
        search: params.search,
      },
    });
  }

  @action
  loading(transition) {
    if (transition.from && transition.from.name === 'authenticated.campaigns.campaign.activity') {
      return false;
    }
    return true;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.pageNumber = 1;
      controller.pageSize = 50;
      controller.divisions = [];
      controller.status = null;
      controller.groups = [];
      controller.search = null;
    }
  }

  @action
  refreshModel() {
    this.modelFor('authenticated.campaigns.campaign').reload();
  }
}
