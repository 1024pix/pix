import type { Store } from '@warp-drive/core';
import type { ModelSchema } from '@warp-drive/core/types';

import ApplicationAdapter from './application';

export default class CampaignProfilesCollectionParticipationSummaryAdapter extends ApplicationAdapter {
  query(store: Store, type: ModelSchema, query: { filter: { campaignId: string } }) {
    const {
      filter: { campaignId, ...filter },
      ...params
    } = query;
    const url = this.apiUrl(`campaigns/${campaignId}/profiles-collection-participations`);
    return this.ajax(url, 'GET', { data: this.sortQueryParams({ ...params, filter }) });
  }
}
