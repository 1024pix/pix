import type { Store } from '@warp-drive/core';
import type { ModelSchema } from '@warp-drive/core/types';

import ApplicationAdapter from './application';

export default class AvailableCampaignParticipationAdapter extends ApplicationAdapter {
  query(store: Store, type: ModelSchema, query: { campaignId: string; organizationLearnerId: string }) {
    const { campaignId, organizationLearnerId, ...params } = query;
    const url = this.apiUrl(`campaigns/${campaignId}/organization-learners/${organizationLearnerId}/participations`);
    return this.ajax(url, 'GET', { data: this.sortQueryParams(params) });
  }
}
