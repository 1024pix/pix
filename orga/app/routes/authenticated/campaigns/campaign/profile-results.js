import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

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
    certificability: {
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
    return this.store.query('campaign-profiles-collection-participation-summary', {
      filter: {
        campaignId: params.campaignId,
        divisions: params.divisions,
        groups: params.groups,
        search: params.search,
        certificability: params.certificability,
      },
      page: {
        number: params.pageNumber,
        size: params.pageSize,
      },
    });
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('pageNumber', 1);
      controller.set('pageSize', 50);
      controller.set('divisions', []);
      controller.set('groups', []);
      controller.set('search', null);
      controller.set('certificability', null);
    }
  }
}
