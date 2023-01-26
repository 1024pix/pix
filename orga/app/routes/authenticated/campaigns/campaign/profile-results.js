import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ProfilesRoute extends Route {
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
    search: {
      refreshModel: true,
    },
  };

  @action
  loading(transition) {
    if (transition.from && transition.from.name === 'authenticated.campaigns.campaign.profile-results') {
      return false;
    }
  }

  model(params) {
    const campaign = this.modelFor('authenticated.campaigns.campaign');
    return RSVP.hash({
      campaign,
      profiles: this.fetchProfileSummaries({ campaignId: campaign.id, ...params }),
    });
  }

  fetchProfileSummaries(params) {
    return this.store.query('CampaignProfilesCollectionParticipationSummary', {
      filter: {
        campaignId: params.campaignId,
        divisions: params.divisions,
        groups: params.groups,
        search: params.search,
      },
      page: {
        number: params.pageNumber,
        size: params.pageSize,
      },
    });
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.pageNumber = 1;
      controller.pageSize = 50;
      controller.divisions = [];
      controller.groups = [];
      controller.search = null;
    }
  }
}
