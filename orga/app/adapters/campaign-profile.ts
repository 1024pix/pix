import type { Store } from '@warp-drive/core';
import type { ModelSchema } from '@warp-drive/core/types';

import ApplicationAdapter from './application';

export default class CampaignProfileAdapter extends ApplicationAdapter {
  queryRecord(store: Store, type: ModelSchema, query: { campaignId: string; campaignParticipationId: string }) {
    const { campaignId, campaignParticipationId, ...params } = query;
    const url = this.apiUrl(`campaigns/${campaignId}/profiles-collection-participations/${campaignParticipationId}`);
    return this.ajax(url, 'GET', { data: this.sortQueryParams(params) });
  }
}
