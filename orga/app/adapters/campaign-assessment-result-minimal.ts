import type { Store } from '@warp-drive/core';
import type { ModelSchema } from '@warp-drive/core/types';

import ApplicationAdapter from './application';

export default class CampaignAssessmentResultMinimalAdapter extends ApplicationAdapter {
  query(store: Store, type: ModelSchema, query: { campaignId: string }) {
    const { campaignId, ...params } = query;
    const url = this.apiUrl(`campaigns/${campaignId}/assessment-results`);
    return this.ajax(url, 'GET', { data: this.sortQueryParams(params) });
  }
}
