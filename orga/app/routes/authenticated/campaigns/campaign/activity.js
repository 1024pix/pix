import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { action } from '@ember/object';

export default class ActivityRoute extends Route {
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
      controller.pageSize = 25;
      controller.divisions = [];
      controller.status = null;
      controller.groups = [];
    }
  }

  @action
  refreshModel() {
    this.modelFor('authenticated.campaigns.campaign').reload();
  }
}
